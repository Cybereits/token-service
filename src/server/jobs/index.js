import agendaClient from '../../framework/jobsManager'
import syncTransactionState from './syncTxState'

// 开启转账监听
import './transactionListener'
// 启动时更新一下所有账户余额
import './updateSysAccount'

const TASKS = {
  syncTxState: 'sync transaction state',
}

agendaClient.define(TASKS.syncTxState, syncTransactionState)

// 添加定时任务
agendaClient
  .on('ready', () => {
    agendaClient.every('5 minutes', TASKS.syncTxState).unique({ syncTxState: true })  // 同步交易状态
    agendaClient.start()
  })
  .on('error', (ex) => {
    console.log(ex)
  })
