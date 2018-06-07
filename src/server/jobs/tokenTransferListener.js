import ContractEvents, { deployContractEventListeners } from '../../core/scenes/listener'
import { checkIsSysThenUpdate } from '../../core/scenes/account'
import { CONTRACT_NAMES } from '../../core/enums'

// todo
// listen to ether transfer and then update balance info

// 添加转账事件监听
ContractEvents
  .on('Transfer', async ({ returnValues }) => {
    let { from, to } = returnValues
    checkIsSysThenUpdate(from)
    checkIsSysThenUpdate(to)
  })
  .on('Error', (err) => {
    console.error(`监听合约转账信息处理失败：${err.message}`)
  })

// 合约监听部署完成后进行转账交易
deployContractEventListeners(CONTRACT_NAMES.cre)
