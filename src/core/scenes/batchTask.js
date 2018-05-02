import { batchTransactinTaskModel, txOperationRecordModel } from '../../core/schemas'

export async function saveBatchTransactionTask(transactions, type) {
  const txs = await txOperationRecordModel.create(transactions)
  return batchTransactinTaskModel({
    amount: txs.length,
    details: txs,
    type,
  }).save()
}

export function getTxOperationsByTaskID(id) {
  return batchTransactinTaskModel.findById(id).populate('details')
}
