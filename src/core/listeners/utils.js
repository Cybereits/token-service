import { createEthEventListener, createContractEventListener } from '../../core/scenes/listener'
import { checkIsSysThenUpdate } from '../../core/scenes/account'

export function establishContractListener(contractName) {
  console.info(`启动 ${contractName} 合约转账监听`)
  createContractEventListener(contractName)
    .on('Transfer', async ({ returnValues }) => {
      let { from, to } = returnValues
      checkIsSysThenUpdate(from, contractName)
      checkIsSysThenUpdate(to, contractName)
    })
    .on('Error', (err) => {
      console.error(`${contractName} 合约转账事件处理失败：${err.message}`)
    })
}

export function startEthListener() {
  console.info('启动 eth 转账监听')
  // eth 转账事件监听
  createEthEventListener()
    .on('Transaction', ({ from, to }) => {
      checkIsSysThenUpdate(from)
      checkIsSysThenUpdate(to)
    })
    .on('Error', (err) => {
      console.error(`eth 转账事件处理失败：${err.message}`)
    })
}
