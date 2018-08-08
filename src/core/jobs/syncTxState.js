import { TaskCapsule, ParallelQueue } from 'async-task-manager'

import getConnection from '../../framework/web3'
import { TxRecordModel } from '../../core/schemas'
import { STATUS } from '../../core/enums'
import { confirmBlockLimitation } from '../../config/env.json'
import { getTrackedTransactions } from '../redis/transaction'
import { confirmTransaction, errorTransaction } from '../scenes/transaction'

let executable = true

export default async function (job, done) {
  if (!executable) {
    console.info('尚有未完成交易状态同步任务...')
    done()
  }
  console.log('开始同步交易状态')
  executable = false

  let conn

  try {
    conn = getConnection()
  } catch (ex) {
    console.error(ex.message)
    executable = true
    done()
    return
  }

  // 当前区块高度
  let currBlockNumber = await conn.eth.getBlockNumber()
  // 有效区块高度
  let blockHeightLimitation = currBlockNumber - confirmBlockLimitation

  // 获取跟踪的交易
  let trackedTxs = await getTrackedTransactions()
    .catch((ex) => {
      console.error(`交易状态同步失败 ${ex}`)
      executable = true
      done()
    })

  // 需要跟踪的发送中的交易
  let sendingTxs = await TxRecordModel
    .find({
      txid: { $in: trackedTxs },
      status: STATUS.sending,
    })
    .catch((ex) => {
      console.error(`交易状态同步失败 ${ex}`)
      executable = true
      done()
    })

  if (sendingTxs.length > 0) {
    // 创建任务队列
    let queue = new ParallelQueue({
      limit: 50,
      toleration: 0,
      span: 100,
    })

    sendingTxs.forEach((transaction) => {
      queue.add(new TaskCapsule(() => new Promise(async (resolve, reject) => {
        let { txid } = transaction
        if (txid) {
          let conn = getConnection()
          let txInfo = await conn.eth.getTransaction(txid).catch(() => false)
          if (txInfo && txInfo.blockNumber && txInfo.blockNumber < blockHeightLimitation) {
            // 确认成功
            confirmTransaction(transaction).then(resolve).catch(reject)
          } else if (transaction.sendTime <= Date.now() - (2 * 60 * 60 * 1000)) {
            // 2 小时后仍未被确认 视作失败
            errorTransaction(transaction, '交易已广播，但在接下来的 2 个小时内未被确认，请手动确认').then(resolve).catch(reject)
          } else {
            // 尚未确认
            resolve()
          }
        } else {
          // 交易失败 没有 txid 却被置为 sending
          errorTransaction(transaction, '缺失 transaction hash 却被标记为 sending').then(resolve).catch(reject)
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
