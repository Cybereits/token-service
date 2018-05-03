import ContractEvents, { deployContractEventListeners } from '../core/scenes/listener'
import { sendToken } from '../core/scenes/token'
import { deployOwnerAddr, deployOwnerSecret, teamAddr01 } from '../config/const'

export default () => {
  // 添加转账事件监听
  ContractEvents
    .on('Transfer', (logs) => {
      console.log('Transfer Event!!!!')
      console.info(logs)
    })

  // 合约监听部署完成后进行转账交易
  deployContractEventListeners()
    .then(() => {
      sendToken(deployOwnerAddr, deployOwnerSecret, teamAddr01, '1')
    })
}
