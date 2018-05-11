import { TaskCapsule, ParallelQueue } from 'async-task-manager'

import { creWalletConnect } from '../../framework/web3'
import { txRecordModel } from '../../core/schemas'
import { STATUS } from '../../core/enums'

let executable = true

// 获取发送中的交易
function getOnSendingTxs() {
  return txRecordModel.find({ status: STATUS.sending })
}

/**
 * 是否是已验证的交易
 * @param {number} heightLimit 已确认的区块高度限制（小于该高度为确认）
 * @param {string} txid 交易id
 */
async function getTxState(heightLimit, txid) {
  let txInfo = await creWalletConnect.eth.getTransaction(txid).catch(() => false)
  if (txInfo && txInfo.blockNumber && txInfo.blockNumber < heightLimit) {
    // 确认成功
    return STATUS.success
  } else if (txInfo === null) {
    // 交易丢失（未被确认也不在 pendingTransactions 里）
    return STATUS.failure
  } else {
    return STATUS.sending
  }
}

export default async function (job, done) {
  if (!executable) {
    console.info('尚有未完成交易状态同步任务...')
    done()
  }
  executable = false
  console.log('开始同步交易状态')
  let currBlockNumber = await creWalletConnect.eth.getBlockNumber()
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
          let state = await getTxState(confirmedBlockHeight, txid).catch(reject)
          if (state === STATUS.sending) {
            // 尚未确认
            resolve()
          } else {
            // 确认或已经丢失
            transaction.status = state
            transaction.save().then(resolve).catch(reject)
          }
        } else {
          // 交易失败 没有 txid 却被置为 sending
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
