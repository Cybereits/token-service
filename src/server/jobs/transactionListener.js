import { createEthEventListener, createContractEventListener } from '../../core/scenes/listener'
import { checkIsSysThenUpdate } from '../../core/scenes/account'
import { CONTRACT_NAMES } from '../../core/enums'

// 添加合约转账事件监听
// todo：监听所有已存在的代币合约的转账事件
createContractEventListener(CONTRACT_NAMES.cre)
  .on('Transfer', async ({ returnValues }) => {
    let { from, to } = returnValues
    checkIsSysThenUpdate(from, CONTRACT_NAMES.cre)
    checkIsSysThenUpdate(to, CONTRACT_NAMES.cre)
  })
  .on('Error', (err) => {
    console.error(`${CONTRACT_NAMES.cre} 合约转账事件处理失败：${err.message}`)
  })

// eth 转账事件监听
createEthEventListener()
  .on('Transaction', ({ from, to }) => {
    checkIsSysThenUpdate(from)
    checkIsSysThenUpdate(to)
  })
  .on('Error', (err) => {
    console.error(`eth 转账事件处理失败：${err.message}`)
  })

