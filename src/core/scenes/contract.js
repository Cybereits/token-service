import { unlockAccount } from './account'
import { connect } from '../../framework/web3'
import { contractMetaModel } from '../schemas'

/**
 * 记录智能合约编译后的 json 数据
 * @param {*} contractData 写入的合约数据
 */
export function seriliazeContractData(name, code, abi, address, subContractAddress) {
  return contractMetaModel.insertMany([{
    name, code, abi, address, subContractAddress,
  }])
}

/**
 * 订阅合约事件
 * @param {object} contract 合约对象
 * @param {function} handlerFunc 事件处理函数
 */
export function subscribeContractAllEvents(contract, handlerFunc) {
  if (typeof handlerFunc !== 'function') {
    throw new TypeError('handleFunc must be a function')
  }
  contract.events.allEvents({}, handlerFunc)
}

/**
 * 订阅合约事件
 * @param {object} contract 合约对象
 * @param {function} handlerFunc 事件处理函数
 * @param {string} eventName 事件名称
 * @param {object|null} filter 事件的过滤器
 */
export function subscribeContractEvent(contract, handlerFunc, eventName, filters) {
  if (typeof handlerFunc !== 'function') {
    return
  }
  let contractEvent = contract.events[eventName]
  if (contractEvent) {
    let event = contractEvent(filters)
    event.watch(handlerFunc)
    return event
  } else {
    console.error(`Invalid contract event ${eventName}`)
    return false
  }
}

/**
 * 部署合约到链上
 * @param {*} connect web3链接
 * @param {*} contract 合约对象
 * @param {*} code 合约code
 * @param {*} deployAccount 部署合约的钱包地址
 * @param {*} accountPwd 部署合约的钱包秘钥
 * @param {*} contractArguments 部署合约的参数数组
 */
async function deploy(connect, contract, code, deployAccount, accountPwd, contractArguments) {
  await unlockAccount(connect, deployAccount, accountPwd)
  return contract.deploy({ data: code, arguments: contractArguments })
}

/**
 * 创建并部署合约
 * @param {*} contractCode 合约code
 * @param {*} contractAbi 合约abi
 * @param {*} deployAccount 部署合约的钱包地址
 * @param {*} accountPwd 部署合约的钱包秘钥
 * @param {*} contractArguments 部署合约的参数数组
 */
export async function createAndDeployContract(contractCode, contractAbi, deployAccount, accountPwd, contractArguments) {
  // 创建合约对象
  let compiledContract = new connect.eth.Contract(contractAbi)
  let result = await deploy(connect, compiledContract, contractCode, deployAccount, accountPwd, contractArguments)
  // 合约部署后的实例对象
  // gas 低了就失败呀
  let newContractInstance = await result.send({
    from: deployAccount,
    gas: 1500000,
    gasPrice: '30000000000000',
  })

  // 锁定部署合约的钱包地址
  connect.eth.personal.lockAccount(deployAccount)
  // 记录合约地址
  compiledContract.options.address = newContractInstance.options.address

  return [compiledContract, newContractInstance]
}
