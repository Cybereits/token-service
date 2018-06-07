import { EventEmitter } from 'events'

import { getContractInstance, subscribeContractAllEvents } from './contract'

const ContractEvents = new EventEmitter()

/**
 * 部署合约事件监听器
 * @param {CONTRACT_NAMES} contractNameEnum 合约名称枚举
 */
export async function deployContractEventListeners(contractNameEnum) {
  let tokenContract = await getContractInstance(contractNameEnum)
  subscribeContractAllEvents(tokenContract, (error, result) => {
    if (error) {
      console.error(`Contract event listeners get error: ${error}`)
    } else if (result) {
      let { event } = result
      ContractEvents.emit(event, result)
    }
  })
}

export default ContractEvents
