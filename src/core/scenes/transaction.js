import { TxRecordModel } from '../../core/schemas'
import { STATUS } from '../../core/enums'

export function confirmTransaction(transaction) {
  transaction.status = STATUS.success
  transaction.confirmTime = new Date()
  transaction.exceptionMsg = null
  return transaction.save()
}

export function errorTransaction(transaction, msg) {
  transaction.status = STATUS.error
  transaction.exceptionMsg = msg
  return transaction.save()
}

export function failTransaction(transaction, msg) {
  transaction.status = STATUS.failure
  transaction.exceptionMsg = msg
  return transaction.save()
}

export async function confirmTransactionByTxid(txid) {
  let transaction = await TxRecordModel.findOne({ txid })
  return confirmTransaction(transaction)
}
