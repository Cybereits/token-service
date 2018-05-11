import { ethWalletConnect, creWalletConnect } from '../../framework/web3'

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
  let ethAccounts = await ethWalletConnect.eth.getAccounts()
  let creAcccounts = await creWalletConnect.eth.getAccounts()
  let tempSet = new Set([...ethAccounts, ...creAcccounts])
  return [...tempSet]
}
