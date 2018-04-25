import agendaClient from '../../framework/jobsManager'
import scanBlocksJob from './scanBlocks'
import syncTransactionState from './syncTxState'
// import syncWallet from './syncWallet'
// import scanBlocksForContractJob from './scanBlocksForContract'

const TASKS = {
  scanBlocks: 'scan blocks',
  syncTxState: 'sync transaction state',
  syncWallet: 'sync wallet info',
  // scanBlocksForContract: 'scan blocks for contract',
}

agendaClient.define(TASKS.scanBlocks, scanBlocksJob)
agendaClient.define(TASKS.syncTxState, syncTransactionState)
// agendaClient.define(TASKS.syncWallet, syncWallet)
// agendaClient.define(TASKS.scanBlocksForContract, scanBlocksForContractJob)

export default () => {
  agendaClient.on('ready', () => {
    agendaClient.every('10 minutes', TASKS.scanBlocks).unique({ scanBlock: true })
    agendaClient.every('20 minutes', TASKS.syncTxState).unique({ syncTxState: true })
    // agendaClient.every('12 hours', TASKS.syncWallet).unique({ syncWallet: true })
    agendaClient.start()
  }).on('error', (ex) => {
    console.log(ex)
  })
}
