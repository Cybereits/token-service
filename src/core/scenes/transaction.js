import { TxRecordModel, BatchTransactinTaskModel } from '../../core/schemas'
import { STATUS } from '../../core/enums'
import { removeTrackedTransaction } from '../redis/transaction'

export function editTransaction(transaction, from, to, amount, creator) {
  // 只有交易状态是待处理和失败时才可以编辑
  if (
    transaction.status === STATUS.pending ||
    transaction.status === STATUS.failure
  ) {
    transaction.from = from
    transaction.to = to
    transaction.amount = amount
    transaction.creator = creator
    return transaction.save()
  } else {
    throw new Error('当前转账的状态不支持编辑')
  }
}

export async function deleteTransaction(transaction) {
  if (transaction.status === STATUS.pending) {
    if (transaction.taskid) {
      let task = await BatchTransactinTaskModel.findOne({ _id: transaction.taskid })
      task.count -= 1
      if (task.count <= 0) {
        return Promise.all([transaction.remove(), task.remove()])
      } else {
        return Promise.all([transaction.remove(), task.save()])
      }
    } else {
      return transaction.remove()
    }
  } else {
    throw new Error('只能删除待处理的发送任务')
  }
}

export function sendingTransaction(transaction, txid, username) {
  transaction.status = STATUS.sending
  transaction.txid = txid
  transaction.sendTime = new Date()
  transaction.executer = username
  console.log(`${username} sent ${txid}`)
  return transaction.save()
}

export function confirmTransaction(transaction) {
  removeTrackedTransaction(transaction.txid)
  transaction.status = STATUS.success
  transaction.confirmTime = new Date()
  transaction.exceptionMsg = null
  return transaction.save()
}

export function errorTransaction(transaction, msg) {
  removeTrackedTransaction(transaction.txid)
  transaction.status = STATUS.error
  transaction.exceptionMsg = msg
  console.log(`${transaction.from} to ${transaction.to} tx error: ${msg}`)
  return transaction.save()
}

export function failTransaction(transaction, msg) {
  removeTrackedTransaction(transaction.txid)
  transaction.status = STATUS.failure
  transaction.exceptionMsg = msg
  transaction.txid = null
  console.log(`${transaction.from} to ${transaction.to} tx failed: ${msg}`)
  return transaction.save()
}

export async function confirmTransactionByTxid(txid) {
  let transaction = await TxRecordModel.findOne({ txid })
  return confirmTransaction(transaction)
}
