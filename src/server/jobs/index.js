import Schedule from 'node-schedule'

import { ethClientConnection, creClientConnection } from '../../framework/web3'
import agendaClient from '../../framework/jobsManager'

import syncAddress from './syncAddress'
import initSyncWallet from './syncWallet'
import syncTransactionState from './syncTxState'

// 同步 eth 钱包信息
const syncEthAccounts = initSyncWallet(ethClientConnection)
// 同步 cre 钱包信息
const syncCreAccounts = initSyncWallet(creClientConnection)

const TASKS = { syncTxState: 'sync transaction state' }

export const syncTransaction = () => {
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
  console.log('add sync wallet schedule task')
  Schedule.scheduleJob('0 0 2 * * *', syncEthAccounts) // 每天凌晨 2 点执行同步 eth 钱包余额的任务
  Schedule.scheduleJob('0 30 2 * * *', syncCreAccounts) // 每天凌晨 2:30 执行同步 cre 钱包余额的任务
  Schedule.scheduleJob('0 0 1 * * *', syncAddress) // 每天凌晨 1 点执行同步钱包地址的任务
}
