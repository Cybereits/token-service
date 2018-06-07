import { TaskCapsule, ParallelQueue } from 'async-task-manager'

import getConnection from '../../framework/web3'
import { txRecordModel } from '../../core/schemas'
import { STATUS } from '../../core/enums'

let executable = true

// 获取发送中的交易
function getOnSendingTxs() {
  return txRecordModel.find({ status: STATUS.sending })
}

export default async function (job, done) {
  if (!executable) {
    console.info('尚有未完成交易状态同步任务...')
    done()
  }
  console.log('开始同步交易状态')

  let conn

  try {
    conn = getConnection()
  } catch (ex) {
    console.error(ex.message)
    return
  }

  executable = false
  let currBlockNumber = await conn.eth.getBlockNumber()
  // 60 个区块高度前的区块内的交易视作已确认
  let blockHeightLimitation = currBlockNumber - 30
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
          let conn = getConnection()
          let txInfo = await conn.eth.getTransaction(txid).catch(() => false)
          if (txInfo && txInfo.blockNumber && txInfo.blockNumber < blockHeightLimitation) {
            // 确认成功
            transaction.status = STATUS.success
            transaction.confirmTime = new Date()
            transaction.save().then(resolve).catch(reject)
          } else if (txInfo === null) {
            // 交易丢失（未被确认也不在 pendingTransactions 里）
            transaction.status = STATUS.failure
            transaction.exceptionMsg = '交易已广播，但长时间内未被确认'
            transaction.save().then(resolve).catch(reject)
          } else {
            // 尚未确认
            resolve()
          }
        } else {
          // 交易失败 没有 txid 却被置为 sending
          transaction.status = STATUS.error
          transaction.exceptionMsg = '缺失 transaction hash 却被标记为 sending'
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
