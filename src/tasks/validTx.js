import { TaskCapsule, ParallelQueue } from 'async-task-manager'

import { connect } from '../framework/web3'
import { prizeInfoModel } from '../core/schemas'
import { STATUS } from '../core/enums'

let succ_counter = 0
let fail_counter = 0
let exception_counter = 0
// 获取发送中的交易
function getSuccTxs() {
  return prizeInfoModel.find({ txid: { $exists: true } })
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

export default async function () {
  console.log('开始回溯交易状态')
  let currBlockNumber = await connect.eth.getBlockNumber()
  // 30 个区块高度前的区块内的交易视作已确认
  let confirmedBlockHeight = currBlockNumber - 30
  let sendingTxs = await getSuccTxs().catch((ex) => {
    console.error(`交易回溯交失败 ${ex}`)
  })
  if (sendingTxs.length > 0) {
    // 创建任务队列
    let queue = new ParallelQueue({
      limit: 20,
      toleration: 0,
    })

    sendingTxs.forEach((transaction) => {
      queue.add(new TaskCapsule(() => new Promise(async (resolve, reject) => {
        let { txid } = transaction
        if (txid) {
          let isValid = await isValidTransaction(confirmedBlockHeight, txid).catch(reject)
          if (!isValid) {
            transaction.status = STATUS.sending
            fail_counter += 1
            console.log(`invalid transaction sent ${fail_counter}`)
            transaction.save().then(resolve).catch(reject)
          } else {
            succ_counter += 1
            console.log(`valid transaction succ sent ${succ_counter}`)
          }
          resolve()
        } else {
          exception_counter += 1
          console.log(`no txid ${exception_counter}`)
          resolve()
        }
      })))
    })

    // 消费任务队列
    await queue
      .consume()
      .then(async () => {
        console.log('交易回溯完毕')
        process.exit(0)
      })
      .catch((ex) => {
        console.error(`交易回溯失败 ${ex}`)
        process.exit(0)
      })
  } else {
    console.log('没有需要回溯的交易')
  }
}
