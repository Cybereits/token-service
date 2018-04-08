import ContractEvents, { deployContractEventListeners } from '../src/core/contractListeners'
import { sendToken } from '../src/utils/token'
import {
  deployOwnerAddr,
  deployOwnerSecret,
  teamAddr01,
} from '../src/config/const'

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
