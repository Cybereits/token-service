import web3 from '../framework/web3'

import {
  getTokenContract,
  getLockContract,
  balanceOf,
} from '../server/utils/coin'

import {
  tokenSupply,
  teamLockPercent,
  gas,
  gasPrice,
  teamAddr01,
  teamAddr02,
  deployOwnerAddr,
  deployOwnerSecret,
} from '../config/const'
import { unlockAccount } from '../server/utils/basic'

const lockSupposed = (tokenSupply * teamLockPercent) / 100

export default async () => {
  let connect = await web3.onWs
  // 获取代币合约实例
  let tokenContractInstance = await getTokenContract(connect)
  // 打印代币合约实例方法
  // console.log(Object.keys(tokenContractInstance.methods))
  // 获取团队锁定合约的部署地址
  let lockContractAddr = await tokenContractInstance.methods.teamLockAddr().call(null)
  console.log(`team allocation lock contract addr: ${lockContractAddr}`)
  // 获取锁定合约实例
  let lockContractInstance = await getLockContract(connect, lockContractAddr)
  // 打印锁定合约实例方法
  console.log(Object.keys(lockContractInstance.methods))

  // let teamLockAmount = await balanceOf(connect, tokenContractInstance, lockContractAddr)
  // console.assert(+teamLockAmount === lockSupposed, `锁定数量与预期不一致，预期${lockSupposed} 实际${teamLockAmount}`)

  // let teamAccountBalance01 = await balanceOf(connect, tokenContractInstance, teamAddr01)
  // console.assert(+teamAccountBalance01 === 0, `锁定期， teamAccount01 地址中的代币数量不为零：${teamAccountBalance01}`)

  // 解锁 team01 锁定的代币
  await unlockAccount(connect, deployOwnerAddr, deployOwnerSecret)
  let unlockResult = await lockContractInstance.methods.unlock(teamAddr02).send({
    from: deployOwnerAddr,
    gas,
    gasPrice,
  })
  console.log(unlockResult)
  process.exit(0)
}
