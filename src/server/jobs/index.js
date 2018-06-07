import agendaClient from '../../framework/jobsManager'
import updateSysAccount from './updateSysAccount'
import syncTransactionState from './syncTxState'

const TASKS = {
  syncTxState: 'sync transaction state',
  updateSysAccount: 'update system account info',
}

agendaClient.define(TASKS.syncTxState, syncTransactionState)
agendaClient.define(TASKS.updateSysAccount, updateSysAccount)

export default () => {
  agendaClient.on('ready', () => {
    console.info('add sync system account schedule task')
    agendaClient.every('5 minutes', TASKS.updateSysAccount).unique({ updateAccount: true })
    console.info('add sync tx schedule task')
    agendaClient.every('5 minutes', TASKS.syncTxState).unique({ syncTxState: true })
    agendaClient.start()
  }).on('error', (ex) => {
    console.log(ex)
  })
}
