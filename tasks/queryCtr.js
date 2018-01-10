import web3 from '../framework/web3'

import { unlockAccount } from '../utils/basic'

import {
  getTokenContract,
  getSubContract,
  balanceOf,
} from '../utils/coin'

import contractMetaData from '../contracts/token.json'

import {
  tokenSupply,
  teamLockPercent,
  gas,
  gasPrice,
  teamAddr01,
  // teamAddr02,
  deployOwnerAddr,
  deployOwnerSecret,
} from '../config/const'

const lockSupposed = (tokenSupply * teamLockPercent) / 100

export default async () => {
  let connect = await web3.onWs

  // 获取代币合约实例
  let tokenContractInstance = await getTokenContract(connect)
  // 打印代币合约实例方法
  // console.log(Object.keys(tokenContractInstance.methods))

  // 获取锁定合约实例
  let lockContractInstance = await getSubContract(connect)
  // 打印锁定合约实例方法
  // console.log(Object.keys(lockContractInstance.methods))

  // 获取团队锁定合约的部署地址
  // 即团队代币锁仓钱包地址
  let lockContractAddr = contractMetaData.subContractAddress[0]
  let teamLockAmount = await balanceOf(connect, tokenContractInstance, lockContractAddr)
  console.assert(+teamLockAmount === lockSupposed, `锁定数量与预期不一致，预期${lockSupposed} 实际${teamLockAmount}`)

  let teamAccountBalance01 = await balanceOf(connect, tokenContractInstance, teamAddr01)
  console.assert(+teamAccountBalance01 === 0, `锁定期， teamAccount01 地址中的代币数量不为零：${teamAccountBalance01}`)

  // 解锁 team01 锁定的代币
  await unlockAccount(connect, deployOwnerAddr, deployOwnerSecret)
  let unlockResult = await lockContractInstance.methods.unlock(teamAddr01).send({
    from: deployOwnerAddr,
    gas,
    gasPrice,
  })
  console.log(unlockResult)
  process.exit(0)
}
