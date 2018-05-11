import { EventEmitter } from 'events'

import { subscribeContractAllEvents } from './contract'
import { getContractInstance } from './token'

const ContractEvents = new EventEmitter()

/**
 * 部署合约事件监听器
 */
export async function deployContractEventListeners() {
  let tokenContract = await getContractInstance()
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
