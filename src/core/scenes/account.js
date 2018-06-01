import { ethClientConnection, creClientConnection } from '../../framework/web3'
import { ethAccountModel } from '../schemas'

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
