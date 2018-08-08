import { createContractEventListener } from '../../core/scenes/listener'
import { checkIsSysThenUpdate } from '../../core/scenes/account'

export default function establishContractListener(contractName) {
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
