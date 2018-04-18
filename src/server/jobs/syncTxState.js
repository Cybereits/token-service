import { TaskCapsule, ParallelQueue } from 'async-task-manager'

import { connect } from '../../framework/web3'
import { prizeInfoModel, transactionInfoModel } from '../../core/schemas'
import { STATUS } from '../../core/enums'

// 获取发送中的交易
function getOnSendingTxs() {
  return prizeInfoModel.find({ status: STATUS.sending })
}

/**
 * 是否是已验证的交易
 * @param {number} heightLimit 区块高度
 * @param {string} txid 交易id
 */
async function isValidTransaction(heightLimit, txid) {
  let count = await transactionInfoModel.find({ txid, block: { $lt: heightLimit } }).count()
  return count > 0
}

export default async function (job, done) {
  console.log('开始同步交易状态')
  let currBlockNumber = await connect.eth.getBlockNumber()
  // 30 个区块高度前的区块内的交易视作已确认
  let confirmedBlockHeight = currBlockNumber - 30
  let sendingTxs = await getOnSendingTxs().catch((ex) => {
    console.error(`交易状态同步失败 ${ex}`)
    done()
  })
  if (sendingTxs.length > 0) {
    // 创建任务队列
    let queue = new ParallelQueue({
      limit: 10,
      toleration: 0,
    })

    sendingTxs.forEach((transaction) => {
      queue.add(new TaskCapsule(() => new Promise(async (resolve, reject) => {
        let { txid } = transaction
        let isValid = await isValidTransaction(confirmedBlockHeight, txid).catch(reject)
        if (isValid) {
          console.log(`${txid} 已成功确认`)
          transaction.status = STATUS.success
          transaction.save().then(resolve).catch(reject)
        } else {
          console.log(`${txid} 尚未确认`)
          resolve()
        }
      })))
    })

    // 消费任务队列
    await queue
      .consume()
      .then(() => {
        console.log('交易状态同步完毕')
        done()
      })
      .catch((ex) => {
        console.error(`交易状态同步失败 ${ex}`)
        done()
      })
  } else {
    console.log('没有需要同步的交易状态')
    done()
  }
}
