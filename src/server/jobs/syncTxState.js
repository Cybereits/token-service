import { TaskCapsule, ParallelQueue } from 'async-task-manager'

import { connect } from '../../framework/web3'
import { prizeInfoModel } from '../../core/schemas'
import { STATUS } from '../../core/enums'

let executable = true

// 获取发送中的交易
function getOnSendingTxs() {
  return prizeInfoModel.find({ status: STATUS.sending })
}

/**
 * 是否是已验证的交易
 * @param {number} heightLimit 已确认的区块高度限制（小于该高度为确认）
 * @param {string} txid 交易id
 */
async function isValidTransaction(heightLimit, txid) {
  let txInfo = await connect.eth.getTransaction(txid).catch(() => false)
  if (txInfo && txInfo.blockNumber && txInfo.blockNumber < heightLimit) {
    return true
  }
  return false
}

export default async function (job, done) {
  if (!executable) {
    console.info('尚有未完成交易状态同步任务...')
    done()
  }
  executable = false
  console.log('开始同步交易状态')
  let currBlockNumber = await connect.eth.getBlockNumber()
  // 60 个区块高度前的区块内的交易视作已确认
  let confirmedBlockHeight = currBlockNumber - 30
  let sendingTxs = await getOnSendingTxs().catch((ex) => {
    console.error(`交易状态同步失败 ${ex}`)
    executable = true
    done()
  })
  if (sendingTxs.length > 0) {
    // 创建任务队列
    let queue = new ParallelQueue({
      limit: 50,
      toleration: 0,
    })

    sendingTxs.forEach((transaction) => {
      queue.add(new TaskCapsule(() => new Promise(async (resolve, reject) => {
        let { txid } = transaction
        if (txid) {
          let isValid = await isValidTransaction(confirmedBlockHeight, txid).catch(reject)
          if (isValid) {
            // console.log(`${txid} 已成功确认`)
            transaction.status = STATUS.success
            transaction.save().then(resolve).catch(reject)
          } else {
            // console.log(`${txid} 尚未确认`)
            resolve()
          }
        } else {
          // 交易失败
          transaction.status = STATUS.failure
          transaction.save().then(resolve).catch(reject)
        }
      })))
    })

    // 消费任务队列
    await queue
      .consume()
      .then(async () => {
        console.log('交易状态同步完毕')
        executable = true
        done()
      })
      .catch((ex) => {
        console.error(`交易状态同步失败 ${ex}`)
        executable = true
        done()
      })
  } else {
    console.log('没有需要同步的交易状态')
    executable = true
    done()
  }
}
