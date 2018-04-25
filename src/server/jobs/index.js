// eth 服务器上没有 mongo 所以不能引用 syncTxState 方法
export const syncTransaction = () => {
  const TASKS = {
    syncTxState: 'sync transaction state',
  }
  const agendaClient = require('../../framework/jobsManager').default
  const syncTransactionState = require('./syncTxState').default
  console.log('add sync tx schedule task')
  agendaClient.define(TASKS.syncTxState, syncTransactionState)
  agendaClient.on('ready', () => {
    agendaClient.every('2 minutes', TASKS.syncTxState).unique({ syncTxState: true })
    agendaClient.start()
  }).on('error', (ex) => {
    console.log(ex)
  })
}

export const syncWallet = () => {
  const Schedule = require('node-schedule')
  const syncWallet = require('./syncWallet').default
  console.log('add sync wallet schedule task')
  Schedule.scheduleJob('* */4 * * *', syncWallet)
}
