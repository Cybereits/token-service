import agendaClient from '../../framework/jobsManager'
import syncTransactionState from './syncTxState'
// import scanBlocksForContractJob from './scanBlocksForContract'

const TASKS = {
  syncTxState: 'sync transaction state',
  // scanBlocksForContract: 'scan blocks for contract',
}

agendaClient.define(TASKS.syncTxState, syncTransactionState)
// agendaClient.define(TASKS.scanBlocksForContract, scanBlocksForContractJob)

export default () => {
  agendaClient.on('ready', () => {
    agendaClient.every('2 minutes', TASKS.syncTxState).unique({ syncTxState: true })
    agendaClient.start()
  }).on('error', (ex) => {
    console.log(ex)
  })
}
