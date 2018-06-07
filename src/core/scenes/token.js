import bignumber from 'bignumber.js'
import getConnection, { ethClientConnection, creClientConnection } from '../../framework/web3'

import { unlockAccount, getAccountInfoByAddress } from './account'
import { getContractInstance } from './contract'
import { TOKEN_TYPE, CONTRACT_NAMES } from '../enums'

bignumber.config({ DECIMAL_PLACES: 5 })

/**
 * 根据转出的账户地址获得其所属钱包客户端链接
 * @param {object} entity 钱包信息
 * @returns {object} 钱包客户端链接
 */
export async function getConnByAccount(entity) {

  // 获取出账钱包信息
  let conn = null

  let { account, group, secret } = entity
  // 根据转出钱包地址的 group 类型判断出其所属的钱包客户端
  if (group === TOKEN_TYPE.cre) {
    conn = creClientConnection
  } else if (group === TOKEN_TYPE.eth) {
    conn = ethClientConnection
  } else {
    conn = getConnection()
  }

  await unlockAccount(conn, account, secret).catch((err) => { throw err })

  return conn
}

/**
 * 获取代币总量（调用totalSupply方法）
 * @param {*} connect web3链接
 */
export async function getTotal(connect) {
  let tokenContract = await getContractInstance(CONTRACT_NAMES.cre)
  let amount = await tokenContract.methods.totalSupply().call(null)
  return connect.eth.extend.utils.fromWei(amount, 'ether')
}

/**
 * 获取指定地址的以太代币余额
 * @param {string} address 钱包地址
 * @returns {number} 以太余额
 */
export async function getEthBalance(address) {
  let conn = getConnection()
  let amount = await conn.eth.getBalance(address)
  return ethClientConnection.eth.extend.utils.fromWei(amount, 'ether')
}

/**
 * 查询钱包地址下的代币数量
 * @param {*} userAddress 要查询的钱包地址
 */
export async function getTokenBalance(userAddress) {
  let tokenContract = await getContractInstance(CONTRACT_NAMES.cre)
  let amount = await tokenContract.methods.balanceOf(userAddress).call(null)
  return getConnection().eth.extend.utils.fromWei(amount, 'ether')
}

/**
 * 查询钱包地址下的代币数量及代币总量，占比等信息
 * @param {*} userAddress 要查询的钱包地址
 */
export async function getTokenBalanceFullInfo(userAddress) {
  const tokenTotalAmount = await getTotal(getConnection())
  const userBalance = await getTokenBalance(userAddress)
  return {
    total: tokenTotalAmount,
    userAddress,
    balance: userBalance,
    proportion: +(+((userBalance / tokenTotalAmount) * 100).toFixed(2)),
  }
}

/**
 * 发送代币
 * @param {*} fromAddress 发送代币的钱包地址
 * @param {*} toAddress 接收代币的钱包地址
 * @param {*} amount 发送代币数量（个）
 */
export async function sendToken(fromAddress, toAddress, amount) {
  let amountInt = +amount
  if (amountInt <= 0) {
    throw new Error('忽略转账额度小于等于0的请求')
  } else {
    let account = await getAccountInfoByAddress(fromAddress)
    let conn = await getConnByAccount(account)

    let gasPrice = await conn
      .eth
      .getGasPrice()
      .then(price => Math.ceil(price * 1.1)) // gasPrice 多给 10% 油价

    return new Promise(async (resolve, reject) => {
      let tokenContract = await getContractInstance(CONTRACT_NAMES.cre, conn)
      let _amount = bignumber(amountInt.toFixed(5))
      let _multiplier = 10 ** tokenContract.decimal
      let _sendAmount = _amount.times(_multiplier)
      console.log('debug1', _multiplier, _sendAmount)

      tokenContract
        .methods
        .transfer(toAddress, _sendAmount)
        .send({ from: fromAddress, gasPrice: gasPrice })
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
 * 发送以太币
 * @param {string} fromAddress 发送 eth 的地址
 * @param {string} toAddress 接收 eth 的地址
 * @param {number} amount 发送数量（个）
 */
export async function sendETH(fromAddress, toAddress, amount) {
  let amountInt = +amount
  if (amountInt <= 0) {
    throw new Error('忽略转账额度小于等于0的请求')
  } else {
    let account = await getAccountInfoByAddress(fromAddress)
    let conn = await getConnByAccount(account)
    return conn
      .eth
      .personal
      .sendTransaction({
        from: fromAddress,
        to: toAddress,
        value: conn.eth.extend.utils.toWei(amountInt.toString(), 'ether'),
      }, account.secret)
      .then((hash) => {
        console.info(`Transfer [${amount}] tokens to [${toAddress}] [txid ${hash}]`)
        return hash
      })
  }
}

/**
 * 估算发送代币所需油费
 * @param {string} toAddress 转入地址
 * @param {number} amount 发送代币数量
 */
export async function estimateGasOfSendToken(toAddress, amount) {
  let tokenContract = await getContractInstance(CONTRACT_NAMES.cre)
  return tokenContract
    .methods
    .Transfer(toAddress, amount)
    .estimateGas()
}

/**
 * 通过输入的数值计算得出对应的代币数量
 * @param {string|number} inputBigNumber 输入的大数值
 * @param {number} decimal 合约规定的代币精度
 * @returns {number} 计算所得代币数量
 */
export function getTokenAmountByBigNumber(inputBigNumber, decimal) {
  let _bigNumber = +inputBigNumber
  let _multiplier = 10 ** decimal
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
  return _bigNumber / _multiplier
}

/**
 * 解析交易记录中的 input 参数
 * warning: unsafe
 * @param {string} inputStr input 参数字符串
 * @param {number} decimal 合约规定的代币精度
 * @returns {Array} 解析后的参数数组
 */
export function decodeTransferInput(inputStr, decimal) {
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
    arr[2] = getTokenAmountByBigNumber(arr[2], decimal)
    return arr
  } else {
    return [str]
  }
}
