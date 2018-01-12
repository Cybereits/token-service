import bignumber from 'bignumber.js'
import web3 from '../framework/web3'

import {
  lockAccount,
  unlockAccount,
} from './basic'

import {
  gas,
  gasPrice,
  contractDecimals,
} from '../config/const'

const multiplier = 10 ** contractDecimals

bignumber.config({ DECIMAL_PLACES: 5 })

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
  let amountInt = +amount
  if (amountInt > 100000000) {
    throw new Error('单笔转账不得超过一亿代币')
  } else if (amountInt <= 0) {
    throw new Error('忽略转账额度小于等于0的请求')
  } else {

    let _amount = bignumber(amountInt.toFixed(5))

    let _sendAmount = _amount.times(multiplier)

    console.info('建立转账链接')
    let connect = await web3.onWs
      .catch((err) => {
        throw new Error(err.message)
      })

    console.info('读取代币合约')
    let tokenContract = await getTokenContract(connect)
      .catch((err) => {
        throw new Error(err.message)
      })

    console.info('解锁账户')
    await unlockAccount(connect, fromAddress, passWord)
      .catch((err) => {
        throw new Error(err.message)
      })

    console.info(`开始发送代币 from ${fromAddress} to ${toAddress} amount ${_amount}`)

    // 由于以太网络可能出现拥堵，所以现在只要发送过程中没有异常即视作成功
    tokenContract
      .methods
      .transfer(toAddress, _sendAmount)
      .send({
        from: fromAddress,
        gas,
        gasPrice,
      })
      .catch((err) => {
        throw new Error(err.message)
      })

    // console.info('锁定账户')
    // await lockAccount(connect, fromAddress)
    //   .catch((err) => {
    //     throw new Error(err.message)
    //   })

    return true
  }
}
