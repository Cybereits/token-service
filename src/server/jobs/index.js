import agendaClient from '../../framework/jobsManager'
import syncTransactionState from './syncTxState'
import updateSysAccount from './updateSysAccount'

// 开启转账监听
import './transactionListener'
// 启动时更新一下所有账户余额

const TASKS = {
  syncTxState: 'sync transaction state',
  updateAccount: 'update system account',
}

agendaClient.define(TASKS.syncTxState, syncTransactionState)
agendaClient.define(TASKS.updateAccount, updateSysAccount)

// 添加定时任务
agendaClient
  .on('ready', () => {
    agendaClient.every('5 minutes', TASKS.syncTxState).unique({ syncTxState: true })  // 同步交易状态
    agendaClient.every('45 minutes', TASKS.updateAccount).unique({ updateAccount: true })  // 同步交易状态
    agendaClient.start()
  })
  .on('error', (ex) => {
    console.log(ex.message)
    process.exit(-1)
  })
