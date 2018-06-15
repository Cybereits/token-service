import { createEthEventListener, createContractEventListener } from '../../core/scenes/listener'
import { checkIsSysThenUpdate } from '../../core/scenes/account'
import { getAllTokenContracts } from '../../core/scenes/contract'

// 监听所有已存在的代币合约的转账事件
getAllTokenContracts().then(res => res.map(({ name }) => name))
  .then((tokenContractNames) => {
    createContractEventListener(tokenContractNames)
      .on('Transfer', async ({ returnValues }) => {
        let { from, to } = returnValues
        checkIsSysThenUpdate(from, tokenContractNames)
        checkIsSysThenUpdate(to, tokenContractNames)
      })
      .on('Error', (err) => {
        console.error(`${tokenContractNames} 合约转账事件处理失败：${err.message}`)
      })
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

