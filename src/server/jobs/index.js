import Schedule from 'node-schedule'

import agendaClient from '../../framework/jobsManager'

const TASKS = {
  syncTxState: 'sync transaction state',
  syncCreWallet: 'sync cre wallet info',
  syncEthWallet: 'sync eth wallet info',
}

// eth 服务器上没有 mongo 所以不能引用 syncTxState 方法
export const creServerSchedule = () => {
  const syncTransactionState = require('./syncTxState').default
  const syncCreWallet = require('./syncCreWallet').default
  console.log('start cre schedule task')
  agendaClient.define(TASKS.syncTxState, syncTransactionState)
  agendaClient.define(TASKS.syncCreWallet, syncCreWallet)
  agendaClient.on('ready', () => {
    agendaClient.every('2 minutes', TASKS.syncTxState).unique({ syncTxState: true })
    agendaClient.every('30 minutes', TASKS.syncCreWallet).unique({ syncCreWallet: true })
    agendaClient.start()
  }).on('error', (ex) => {
    console.log(ex)
  })
}

export const ethServerSchedule = () => {
  const syncEthWallet = require('./syncEthWallet').default
  console.log('start eth schedule task')
  Schedule.scheduleJob('*/30 * * * *', syncEthWallet)
}
