import { ethWalletConnect, creWalletConnect } from '../../framework/web3'

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
    agendaClient.every('10 minutes', TASKS.syncTxState).unique({ syncTxState: true })
    agendaClient.start()
  }).on('error', (ex) => {
    console.log(ex)
  })
}

export const syncWallet = () => {
  const Schedule = require('node-schedule')
  const syncEthWallet = require('./syncWallet').default(ethWalletConnect)
  const syncCreWallet = require('./syncWallet').default(creWalletConnect)
  const syncAddress = require('./syncAddress').default
  console.log('add sync wallet schedule task')
  Schedule.scheduleJob('0 0 2 * * *', syncEthWallet) // 每天凌晨 2 点执行同步 eth 钱包余额的任务
  Schedule.scheduleJob('0 30 2 * * *', syncCreWallet) // 每天凌晨 2:30 执行同步 cre 钱包余额的任务
  Schedule.scheduleJob('0 0 1 * * *', syncAddress) // 每天凌晨 1 点执行同步钱包地址的任务
}
