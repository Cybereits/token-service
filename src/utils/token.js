import bignumber from 'bignumber.js'
import { connect } from '../framework/web3'

import {
  unlockAccount,
} from './basic'

import {
  contractDecimals,
} from '../config/const'

import tokenContractData from '../contracts/token.json'

const multiplier = 10 ** contractDecimals

const tokenContractAbi = JSON.parse(tokenContractData.abi[1])
const tokenContractAddress = tokenContractData.address[0]
const lockContractAbi = JSON.parse(tokenContractData.abi[0])
const tokenSubContractAddress = tokenContractData.subContractAddress[0]

export const tokenContract = new connect.eth.Contract(tokenContractAbi, tokenContractAddress)
export const tokenContractMethods = tokenContract.methods
export const subContract = new connect.eth.Contract(lockContractAbi, tokenSubContractAddress)

bignumber.config({ DECIMAL_PLACES: 5 })

/**
 * 获取代币总量（调用totalSupply方法）
 * @param {*} connect web3链接
 */
export async function getTotal(connect) {
  let amount = await tokenContract.methods.totalSupply().call(null)
  return connect.eth.extend.utils.fromWei(amount, 'ether')
}

/**
 * 获取制定地址的
 * @param {*} connect web3链接
 * @param {*} contract 合约对象
 * @param {*} userAddress 用户地址
 */
export async function balanceOf(connect, userAddress) {
  let amount = await tokenContract.methods.balanceOf(userAddress).call(null)
  return connect.eth.extend.utils.fromWei(amount, 'ether')
}

/**
 * 查询钱包地址下的代币数量
 * @param {*} userAddress 要查询的钱包地址
 */
export async function getTokenBalance(userAddress) {
  let userBalance = await balanceOf(connect, userAddress)
  return userBalance
}

/**
 * 查询钱包地址下的代币数量及代币总量，占比等信息
 * @param {*} userAddress 要查询的钱包地址
 */
export async function getTokenBalanceFullInfo(userAddress) {
  let tokenTotalAmount = await getTotal(connect)
  let userBalance = await balanceOf(connect, userAddress)
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
 * @param {*} gas 油费
 * @param {*} gasPrice 油价
 */
export async function sendToken(fromAddress, passWord, toAddress, amount, gas, gasPrice) {
  let amountInt = +amount

  if (amountInt <= 0) {
    throw new Error('忽略转账额度小于等于0的请求')
  } else {

    let _amount = bignumber(amountInt.toFixed(5))
    let _sendAmount = _amount.times(multiplier)

    await unlockAccount(connect, fromAddress, passWord)
      .catch((err) => {
        throw new Error(err.message)
      })

    if (!gasPrice) {
      gasPrice = await connect
        .eth
        .getGasPrice()
        .catch((ex) => {
          console.error(`get gas price failded: ${fromAddress}`)
        })
    }

    return new Promise((resolve, reject) => {
      tokenContract
        .methods
        .transfer(toAddress, _sendAmount)
        .send({
          from: fromAddress,
          gas: gas,
          gasPrice: gasPrice,
        })
        .on('transactionHash', (hash) => {
          console.info(`广播代币转账信息\nfrom ${fromAddress}\nto ${toAddress}\namount ${_amount}\ntxid ${hash}\ngas ${gas}\ngasPrice ${gasPrice}\n-------------`)
          resolve(hash)
        })
        .on('error', (err) => {
          reject(err)
        })
    })
  }
}

/**
 * 估算发送代币所需油费
 * @param {string} toAddress 转入地址
 * @param {number} amount 发送代币数量
 */
export function estimateGasOfSendToken(toAddress, amount) {
  return tokenContract
    .methods
    .Transfer(toAddress, amount)
    .estimateGas()
}

/**
 * 通过输入的数值计算得出对应的代币数量
 * @param {string|number} inputBigNumber 输入的大数值
 */
export function getTokenAmountByBigNumber(inputBigNumber) {
  let _bigNumber = +inputBigNumber
  if (isNaN(_bigNumber)) {
    if (typeof inputBigNumber === 'string') {
      if (inputBigNumber.indexOf('0x') !== 0) {
        // 默认加上16进制的前缀
        _bigNumber = +`0x${inputBigNumber}`
        if (isNaN(_bigNumber)) {
          // 如果非有效数值则返回 0
          return 0
        }
      }
    } else {
      // 不知道传入的是个什么类型,返回 0
      return 0
    }
  }
  return _bigNumber / multiplier
}

