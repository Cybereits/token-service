import BN from 'bignumber.js'

import getConnection from '../../framework/web3'
import { getConnByAddressThenUnlock, getAccountInfoByAddress } from './account'
import { getContractInstance } from './contract'
import { TOKEN_TYPES, CONTRACT_NAMES } from '../enums'
import { ContractMetaModel } from '../schemas'

BN.config({ DECIMAL_PLACES: 5 })

/**
 * 获取代币总量（调用totalSupply方法）
 * @param {*} connect web3链接
 */
export async function getTotal(connect) {
  let contractPromise = getContractInstance(CONTRACT_NAMES.cre)
  let amountPromise = tokenContract.methods.totalSupply().call(null)

  let tokenContract = await contractPromise
  let amount = await amountPromise

  return amount / (10 ** tokenContract.decimal)
}

/**
 * 获取指定地址的以太代币余额
 * @param {string} address 钱包地址
 * @returns {number} 以太余额
 */
export async function getEthBalance(address) {
  let conn = getConnection()
  let amount = await conn.eth.getBalance(address)
  return conn.eth.extend.utils.fromWei(amount, 'ether')
}

/**
 * 查询钱包地址下的代币数额
 * @param {*} userAddress 要查询的钱包地址
 * @param {string} contractMetaName 合约名称枚举（默认 cre）
 */
export async function getTokenBalance(userAddress, contractMetaName = CONTRACT_NAMES.cre) {
  let contractPromise = getContractInstance(contractMetaName)
  let amountPromise = tokenContract.methods.balanceOf(userAddress).call(null)

  let tokenContract = await contractPromise
  let amount = await amountPromise

  return amount / (10 ** tokenContract.decimal)
}

/**
 * 查询钱包地址下的代币数额及代币总量，占比等信息
 * @param {*} userAddress 要查询的钱包地址
 */
export async function getTokenBalanceFullInfo(userAddress) {
  let totalPromise = getTotal(getConnection())
  let balancePromise = getTokenBalance(userAddress)

  const tokenTotalAmount = await totalPromise
  const userBalance = await balancePromise

  return {
    total: tokenTotalAmount,
    userAddress,
    balance: userBalance,
    proportion: +(+((userBalance / tokenTotalAmount) * 100).toFixed(2)),
  }
}

/**
 * 发送代币
 * @param {string} fromAddress 发送代币的钱包地址
 * @param {string} toAddress 接收代币的钱包地址
 * @param {number} amount 发送代币数额（个）
 * @param {object} options 其它配置（可选）
 */
export async function sendToken(fromAddress, toAddress, amount, options = {}) {
  let _amount = new BN(amount)
  if (_amount.lessThanOrEqualTo(0)) {
    throw new Error('忽略转账额度小于等于0的请求')
  } else {
    let {
      tokenType = TOKEN_TYPES.cre,
      gasPrice,
      gas,
      priceRate = 1.1,  // 油费溢价率
    } = options

    let contractMetaPromise = ContractMetaModel.findOne({ symbol: tokenType }, { name: 1 })
    let getConnPromise = getConnByAddressThenUnlock(fromAddress)

    let { name } = await contractMetaPromise
    let conn = await getConnPromise

    if (!gasPrice) {
      gasPrice = await conn
        .eth
        .getGasPrice()
        .then(price => price * priceRate)
    }

    return new Promise(async (resolve, reject) => {
      let tokenContract = await getContractInstance(name, conn)
      let _multiplier = 10 ** tokenContract.decimal
      let _sendAmount = _amount.mul(_multiplier)

      tokenContract
        .methods
        .transfer(toAddress, _sendAmount)
        .send({ from: fromAddress, gasPrice, gas })
        .on('transactionHash', (hash) => {
          console.info(`Transfer [${_amount.toString(10)}] tokens to [${toAddress}] [txid ${hash}]`)
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
 * @param {number} amount 发送数额（个）
 * @param {object} options 其它配置（可选）
 */
export async function sendETH(fromAddress, toAddress, amount, options = {}) {
  let { gasPrice, gas } = options
  let _amount = new BN(amount)
  if (_amount.lessThanOrEqualTo(0)) {
    throw new Error('忽略转账额度小于等于0的请求')
  } else {
    let getAccountPromise = getAccountInfoByAddress(fromAddress)
    let getConnPromise = getConnByAddressThenUnlock(fromAddress)

    let account = await getAccountPromise
    let conn = await getConnPromise

    return conn
      .eth
      .personal
      .sendTransaction({
        from: fromAddress,
        to: toAddress,
        value: conn.eth.extend.utils.toWei(_amount.toString(10), 'ether'),
        gasPrice,
        gas,
      }, account.secret)
      .then((hash) => {
        console.info(`Transfer [${amount}] tokens to [${toAddress}] [txid ${hash}]`)
        return hash
      })
  }
}

/**
 * 将出账地址下的所有以太转移到指定入账地址
 * @param {string} fromAddress 出账地址
 * @param {string} toAddress 入账地址
 */
export async function transferAllEth(fromAddress, toAddress) {

  if (toAddress === fromAddress) {
    return
  }

  console.assert(toAddress, '接收地址不能为空!')

  let connect = getConnection()

  let balancePromise = connect.eth.getBalance(fromAddress)
  let gasPricePromise = connect.eth.getGasPrice()
  let gasFeePromise = connect.eth.estimateGas({ from: fromAddress })

  let total = await balancePromise
  let gasPrice = await gasPricePromise
  let gasFee = await gasFeePromise

  // if (+gasPrice === 0) {
  //   gasPrice = 30000
  // }

  total = new BN(total)
  gasPrice = new BN(gasPrice)
  gasFee = new BN(gasFee)

  let txCost = gasPrice.mul(gasFee)
  let transAmount = connect.eth.extend.utils.fromWei(total.minus(txCost).toString(10))

  console.log(`余额\t${
    connect.eth.extend.utils.fromWei(total.toString(10))
    } 油费\t${
    gasPrice.toString(10)
    } 用量\t${
    gasFee.toString(10)
    } 总花费\t${
    connect.eth.extend.utils.fromWei(txCost.toString(10))
    } 实际发送数额\t${
    transAmount
    }`)

  sendETH(fromAddress, toAddress, transAmount, { gasPrice, gasFee })
}

/**
 * 估算发送代币所需油费
 * @param {string} toAddress 转入地址
 * @param {number} amount 发送代币数额
 */
export async function estimateGasOfSendToken(toAddress, amount) {
  let tokenContract = await getContractInstance(CONTRACT_NAMES.cre)
  return tokenContract
    .methods
    .Transfer(toAddress, amount)
    .estimateGas()
}

/**
 * 通过输入的数值计算得出对应的代币数额
 * @param {string|number} inputBigNumber 输入的大数值
 * @param {number} decimal 合约规定的代币精度
 * @returns {number} 计算所得代币数额
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
    // 第三个参数是交易的代币数额 需要转换成有效数值
    arr[2] = getTokenAmountByBigNumber(arr[2], decimal)
    return arr
  } else {
    return [str]
  }
}
