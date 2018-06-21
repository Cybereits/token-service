import { EthAccountModel } from '../schemas'
import { getEthBalance, getTokenBalance } from './token'
import { getTokenContractMeta } from './contract'
import getConnection, { creClientConnection, ethClientConnection } from '../../framework/web3'
import { TOKEN_TYPES } from '../enums'

export function unlockAccount(connect, unlockAccount, passWord) {
  return connect.eth.personal.unlockAccount(unlockAccount, passWord, 20)
}

export function lockAccount(connect, lockAccount) {
  return connect.eth.personal.lockAccount(lockAccount)
}

/**
 * 获取所有客户端下创建的钱包地址
 * @returns {Array<string>} 所有的钱包地址
 */
export async function getAllAccounts() {
  return EthAccountModel.find(null, { account: 1 }).then(t => t.map(({ account }) => account))
}

/**
 * 获取系统生成的钱包账户信息
 * @param {string} address 钱包地址
 * @returns {ethAccountModel} 钱包账户信息
 */
export async function getAccountInfoByAddress(address) {
  let account = await EthAccountModel
    .findOne({ account: address })
    .catch((ex) => {
      console.err(ex.message)
    })
  if (account) {
    return account
  } else {
    throw new Error(`没有找到指定的钱包信息 [${address}]`)
  }
}

/**
 * 根据账户地址获得其所属钱包客户端链接,并解锁账户
 * @param {object} address 钱包地址
 * @returns {object} 钱包客户端链接
 */
export async function getConnByAddressThenUnlock(address) {

  // 获取出账钱包信息
  let conn = null

  let { account, group, secret } = await getAccountInfoByAddress(address)

  // 根据转出钱包地址的 group 类型判断出其所属的钱包客户端
  if (group === TOKEN_TYPES.cre) {
    conn = creClientConnection
  } else if (group === TOKEN_TYPES.eth) {
    conn = ethClientConnection
  } else {
    conn = getConnection()
  }

  await unlockAccount(conn, account, secret).catch((err) => { throw err })

  return conn
}

/**
 * 判断是否是系统地址
 * @param {string} address 钱包地址
 * @returns {Promise<bool>}
 */
export function isSysAccount(address) {
  return EthAccountModel.count({ account: address }).then(res => res >= 1)
}

/**
 * 更新指定钱包的账户余额
 * @param {string} address 钱包地址
 * @param {string} contractName 代币合约名称
 * @returns {Promise}
 */
export async function updateBalanceOfAccount(address, contractName) {
  let amount
  let symbol

  if (!contractName) {
    // 默认视作 eth 账户
    amount = await getEthBalance(address)
    symbol = 'eth'
  } else {
    amount = await getTokenBalance(address, contractName)
    let tokenContract = await getTokenContractMeta(contractName)
    symbol = tokenContract.symbol
  }

  let account = await EthAccountModel.findOne({ account: address })

  if (!account.balances) {
    account.balances = {}
  }

  account.balances[symbol] = +amount

  return EthAccountModel.update({ account: address }, account)
}

/**
 * 检查是否为系统地址，如果是则更新账户余额
 * @param {string} address 钱包地址
 * @param {string} tokenType 代币类型
 * @returns {Promise}
 */
export async function checkIsSysThenUpdate(address, tokenType) {
  let result = await isSysAccount(address)
  if (result) {
    return updateBalanceOfAccount(address, tokenType)
  } else {
    return false
  }
}
