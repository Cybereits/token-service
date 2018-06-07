import { ethClientConnection, creClientConnection } from '../../framework/web3'
import { ethAccountModel } from '../schemas'
import { getEthBalance, getTokenBalance } from './token'

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
  let ethAccounts = await ethClientConnection.eth.getAccounts()
  let creAcccounts = await creClientConnection.eth.getAccounts()
  let tempSet = new Set([...ethAccounts, ...creAcccounts])
  return [...tempSet]
}

/**
 * 获取系统生成的钱包账户信息
 * @param {string} address 钱包地址
 * @returns {ethAccountModel} 钱包账户信息
 */
export async function getAccountInfoByAddress(address) {
  let account = await ethAccountModel
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
 * 判断是否是系统地址
 * @param {string} address 钱包地址
 * @returns {Promise<bool>}
 */
export function isSysAccount(address) {
  return ethAccountModel.count({ account: address }).then(res => res >= 1)
}

/**
 * 更新指定钱包的账户余额
 * @param {string} address 钱包地址
 */
export async function updateBalanceOfAccount(address) {
  let ethAmount = await getEthBalance(address)
  let creAmount = await getTokenBalance(address)

  // 更新账户信息
  return ethAccountModel.update(
    {
      account: address,
    },
    {
      $set: {
        creAmount,
        ethAmount,
      },
    })
}

/**
 * 检查是否为系统地址，如果是则更新账户余额
 * @param {string} address 钱包地址
 * @returns {Promise}
 */
export async function checkIsSysThenUpdate(address) {
  let result = await isSysAccount(address)
  if (result) {
    return updateBalanceOfAccount(address)
  } else {
    return false
  }
}
