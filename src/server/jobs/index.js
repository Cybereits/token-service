import agendaClient from '../../framework/jobsManager'
import updateSysAccount from './updateSysAccount'
import syncTransactionState from './syncTxState'

// 开启代币合约转账监听
import './tokenTransferListener'

const TASKS = {
  syncTxState: 'sync transaction state',
  updateSysAccount: 'update system account info',
}

agendaClient.define(TASKS.syncTxState, syncTransactionState)
agendaClient.define(TASKS.updateSysAccount, updateSysAccount)

export default () => {
  // 添加定时任务
  agendaClient
    .on('ready', () => {
      agendaClient.every('5 minutes', TASKS.updateSysAccount).unique({ updateAccount: true }) // 同步系统账户余额信息
      agendaClient.every('2 minutes', TASKS.syncTxState).unique({ syncTxState: true })  // 同步交易状态
      agendaClient.start()
    })
    .on('error', (ex) => {
      console.log(ex)
    })
}
