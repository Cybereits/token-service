import { EventEmitter } from 'events'

import getConnection from '../../framework/web3'
import { getContractInstance, subscribeContractAllEvents } from './contract'
import { getAllAccounts } from '../scenes/account'

/**
 * 创建合约事件监听器
 * @param {CONTRACT_NAMES} contractNameEnum 合约名称枚举
 * @returns {EventEmitter} 事件监听器
 */
export function createContractEventListener(contractNameEnum) {
  let eventBus = new EventEmitter()

  getContractInstance(contractNameEnum)
    .then((tokenContract) => {
      subscribeContractAllEvents(tokenContract, (error, result) => {
        if (error) {
          throw error
        } else if (result) {
          eventBus.emit(result.event, result)
        }
      })
    })

  return eventBus
}

/**
 * 创建 eth 事件监听器
 * @returns {EventEmitter} 事件监听器
 */
export function createEthEventListener() {
  let eventBus = new EventEmitter()
  let connection = getConnection()

  getAllAccounts().then((accounts) => {
    connection.eth.subscribe('newBlockHeaders')
      .on('data', async ({ hash: blockHash }) => {
        let { transactions } = await connection.eth.getBlock(blockHash)
        if (transactions && transactions.length > 0) {
          // 将异步的任务放在串行队列中处理
          transactions
            .map(txid => () => connection.eth.getTransactionReceipt(txid)
              .then((receipt) => {
                if (receipt) {
                  let { contractAddress, from, to } = receipt
                  if (contractAddress === null) {
                    eventBus.emit('Transaction', {
                      from: connection.eth.extend.utils.toChecksumAddress(from),
                      to: connection.eth.extend.utils.toChecksumAddress(to),
                    })
                  }
                }
              }))
            .reduce((prev, next) => prev.then(next), Promise.resolve())
        }
      })
  })

  return eventBus
}
