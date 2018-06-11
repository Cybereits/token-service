import { createEthEventListener, createContractEventListener } from '../../core/scenes/listener'
import { checkIsSysThenUpdate } from '../../core/scenes/account'
import { CONTRACT_NAMES } from '../../core/enums'

// 添加合约转账事件监听
createContractEventListener(CONTRACT_NAMES.cre)
  .on('Transfer', async ({ returnValues }) => {
    let { from, to } = returnValues
    checkIsSysThenUpdate(from)
    checkIsSysThenUpdate(to)
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

