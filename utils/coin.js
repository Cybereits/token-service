import web3 from '../framework/web3'
import { lockAccount, unlockAccount } from './basic'
import {
  gas,
  gasPrice,
  contractDecimals,
} from '../config/const'

/**
 * 获取代币合约
 * @param {*} connect web3链接
 */
export async function getTokenContract(connect) {
  let tokenContractData = require('../contracts/token.json')
  const tokenContractAbi = JSON.parse(tokenContractData.abi[1])
  const tokenContractAddress = tokenContractData.address[0]
  return new connect.eth.Contract(tokenContractAbi, tokenContractAddress)
}

/**
 * 获取锁仓合约
 * @param {*} connect web3链接
 */
export async function getSubContract(connect) {
  let tokenContractData = require('../contracts/token.json')
  const lockContractAbi = JSON.parse(tokenContractData.abi[0])
  const tokenSubContractAddress = tokenContractData.subContractAddress[0]
  return new connect.eth.Contract(lockContractAbi, tokenSubContractAddress)
}

/**
 * 获取代币总量（调用totalSupply方法）
 * @param {*} connect web3链接
 * @param {*} contract 合约对象
 */
export async function getTotal(connect, contract = null) {
  let amount = await contract.methods.totalSupply().call(null)
  return connect.eth.extend.utils.fromWei(amount, 'ether')
}

/**
 * 获取制定地址的
 * @param {*} connect web3链接
 * @param {*} contract 合约对象
 * @param {*} userAddress 用户地址
 */
export async function balanceOf(connect, contract = null, userAddress) {
  let amount = await contract.methods.balanceOf(userAddress).call(null)
  return connect.eth.extend.utils.fromWei(amount, 'ether')
}

/**
 * 查询钱包地址下的代币数量
 * @param {*} userAddress 要查询的钱包地址
 */
export async function getTokenBalance(userAddress) {
  let tokenContractData = require('../contracts/token.json')
  const tokenContractAddress = tokenContractData.address[0]
  let connect = await web3.onWs
  let tokenContract = await getTokenContract(connect)
  let tokenTotalAmount = await getTotal(connect, tokenContract)
  let userBalance = await balanceOf(connect, tokenContract, userAddress)
  return {
    tokenContractAddress,
    total: tokenTotalAmount,
    userAddress,
    balance: userBalance,
    proportion: +(+((userBalance / tokenTotalAmount) * 100).toFixed(2)),
  }
}

/**
 * 发送代币
 * @param {*} fromAddress 发送代币的钱包地址
 * @param {*} passWord 发送代币地址的秘钥
 * @param {*} toAddress 接收代币的钱包地址
 * @param {*} amount 发送代币数量
 */
export async function sendToken(fromAddress, passWord, toAddress, amount) {
  if (amount > 10000000) {
    throw new Error('单笔转账不得超过一千万代币')
  } else if (amount <= 0) {
    throw new Error('忽略转账额度小于等于0的请求')
  } else {
    let connect = await web3.onWs
    let tokenContract = await getTokenContract(connect)
    // 对于超过20位的数值会转换成科学计数法
    // 所以这里换成字符串拼接的方式
    let _amountDecimals = `${amount}${'0'.repeat(contractDecimals)}`
    await unlockAccount(connect, fromAddress, passWord)
    let sendToken = await tokenContract
      .methods
      .transfer(toAddress, _amountDecimals)
      .send({
        from: fromAddress,
        gas,
        gasPrice,
      })

    lockAccount(connect, fromAddress)
    return {
      result: sendToken.events.Transfer,
      msg: `send finished, from ${fromAddress} to ${toAddress} amount ${_amountDecimals} txid ${sendToken.events.Transfer.transactionHash}`,
    }
  }
}
