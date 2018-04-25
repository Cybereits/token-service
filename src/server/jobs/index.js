import agendaClient from '../../framework/jobsManager'
import syncTransactionState from './syncTxState'

const TASKS = {
  syncTxState: 'sync transaction state',
}

agendaClient.define(TASKS.syncTxState, syncTransactionState)

export default () => {
  agendaClient.on('ready', () => {
    agendaClient.every('2 minutes', TASKS.syncTxState).unique({ syncTxState: true })
    agendaClient.start()
  }).on('error', (ex) => {
    console.log(ex)
  })
}
