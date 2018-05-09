import bignumber from 'bignumber.js'
import { ethWalletConnect, creWalletConnect } from '../../framework/web3'

import { unlockAccount } from './account'
import { contractDecimals } from '../../config/const'
import { contractMetaModel } from '../../core/schemas'

const multiplier = 10 ** contractDecimals
bignumber.config({ DECIMAL_PLACES: 5 })

const Instances = {
  token: null,
  lock: null,
}

/**
 * 获取代币合约元信息
 */
export async function getTokenContractMeta() {
  let meta = await contractMetaModel
    .findOne({ name: 'Cybereits Token' })
    .then((res) => {
      let contractMeta = {}
      contractMeta.tokenContractAbi = JSON.parse(res.abi[1])
      contractMeta.tokenContractAddress = res.address[0]
      contractMeta.lockContractAbi = JSON.parse(res.abi[0])
      contractMeta.tokenSubContractAddress = res.subContractAddress[0]
      return contractMeta
    })
    .catch((ex) => {
      console.error(ex)
      return null
    })

  return meta
}

/**
 * 获取合约实例
 */
export async function getContractInstance() {
  if (!Instances.token) {
    const { tokenContractAbi, tokenContractAddress } = await getTokenContractMeta()
    Instances.token = new ethWalletConnect.eth.Contract(tokenContractAbi, tokenContractAddress)
  }
  return Instances.token
}

/**
 * 获取子合约实例
 */
export async function getSubContractInstance() {
  if (!Instances.lock) {
    const { lockContractAbi, tokenSubContractAddress } = await getTokenContractMeta()
    Instances.lock = new ethWalletConnect.eth.Contract(lockContractAbi, tokenSubContractAddress)
  }
  return Instances.lock
}

/**
 * 获取代币总量（调用totalSupply方法）
 * @param {*} connect web3链接
 */
export async function getTotal(connect) {
  let tokenContract = await getContractInstance()
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
  let tokenContract = await getContractInstance()
  let amount = await tokenContract.methods.balanceOf(userAddress).call(null)
  return connect.eth.extend.utils.fromWei(amount, 'ether')
}

/**
 * 查询钱包地址下的代币数量
 * @param {*} userAddress 要查询的钱包地址
 */
export async function getTokenBalance(userAddress) {
  let userBalance = await balanceOf(ethWalletConnect, userAddress)
  return userBalance
}

/**
 * 查询钱包地址下的代币数量及代币总量，占比等信息
 * @param {*} userAddress 要查询的钱包地址
 */
export async function getTokenBalanceFullInfo(userAddress) {
  const tokenTotalAmount = await getTotal(ethWalletConnect)
  const userBalance = await balanceOf(ethWalletConnect, userAddress)
  const { tokenContractAddress } = await getTokenContractMeta()
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

    await unlockAccount(creWalletConnect, fromAddress, passWord)
      .catch((err) => {
        throw new Error(err.message)
      })

    if (!gasPrice) {
      gasPrice = await creWalletConnect
        .eth
        .getGasPrice()
        .catch((ex) => {
          console.error(`get gas price failded: ${fromAddress}`)
        })
      // gasPrice 多给 30%
      gasPrice *= 1.3
    }

    return new Promise(async (resolve, reject) => {
      let tokenContract = await getContractInstance()
      tokenContract
        .methods
        .transfer(toAddress, _sendAmount)
        .send({
          from: fromAddress,
          gas: gas,
          gasPrice: gasPrice,
        })
        .on('transactionHash', (hash) => {
          console.info(`Transfer [${_amount}] tokens to [${toAddress}] [txid ${hash}]`)
          resolve(hash)
        })
        .on('error', reject)
        .catch(reject)
    })
  }
}

/**
 * 估算发送代币所需油费
 * @param {string} toAddress 转入地址
 * @param {number} amount 发送代币数量
 */
export async function estimateGasOfSendToken(toAddress, amount) {
  let tokenContract = await getContractInstance()
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

/*
 * 解析交易记录中的 input 参数
 * warning: unsafe
 * @param { string } inputStr input 参数字符串
 * @returns { Array } 解析后的参数数组
*/
export function decodeTransferInput(inputStr) {
  // Transfer转账的数据格式
  // 0xa9059cbb0000000000000000000000002abe40823174787749628be669d9d9ae4da8443400000000000000000000000000000000000000000000025a5419af66253c0000
  let str = inputStr.toString()
  let seperator = '00000000000000000000000'  // 23个0
  if (str.length >= 10) {
    let arr = str.split(seperator)
    // 参数解析后
    // 第一个参数是函数的id 16进制格式，不需要改变
    // 第二个参数是转入地址，加 0x 前缀转换成有效地址
    arr[1] = `0x${arr[1]}`
    // 第三个参数是交易的代币数量 需要转换成有效数值
    arr[2] = getTokenAmountByBigNumber(arr[2])
    return arr
  } else {
    return [str]
  }
}
