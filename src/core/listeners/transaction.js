import { getListener } from '../../core/scenes/listener'
import { addTrackedTransaction, removeTrackedTransaction } from '../redis/transaction'
import { confirmTransactionByTxid } from '../scenes/transaction'

const LISTENER_NAME = '__transaction_listener'
const EVENTS = {
  sendTransaction: 'sendTx',
  confirm: 'confirm',
}

let txListener = null

export default function establishTransactionListener() {
  txListener = getListener(LISTENER_NAME)

  txListener.on(EVENTS.sendTransaction, (txid) => {
    addTrackedTransaction(txid)
    console.log(`[transaction sent]: ${txid}`)
  })

  txListener.on(EVENTS.confirm, (txid) => {
    removeTrackedTransaction(txid)
    confirmTransactionByTxid(txid)
    console.log(`[transaction confirmed]: ${txid}`)
  })
}

export function publishConfirmInfo(txid) {
  txListener.emit(EVENTS.confirm, txid)
}

export function publishTransaction(txid) {
  txListener.emit(EVENTS.sendTransaction, txid)
}
