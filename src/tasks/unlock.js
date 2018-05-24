import { creWalletConnect } from '../framework/web3'

import { unlockAccount } from '../core/scenes/account'

import { getContractInstance } from '../core/scenes/token'

import {
  teamAddr01,
  teamAddr02,
  teamAddr03,
  teamAddr04,
  teamAddr05,
  teamAddr06,
  deployOwnerAddr,
  deployOwnerSecret,
} from '../config/const.json'

export default async (index) => {
  let unlockAddr = ''

  switch (+index) {
    case 1:
      unlockAddr = teamAddr01
      break
    case 2:
      unlockAddr = teamAddr02
      break
    case 3:
      unlockAddr = teamAddr03
      break
    case 4:
      unlockAddr = teamAddr04
      break
    case 5:
      unlockAddr = teamAddr05
      break
    case 6:
      unlockAddr = teamAddr06
      break
  }

  await unlockAccount(creWalletConnect, deployOwnerAddr, deployOwnerSecret)
  console.log(`unlock ${unlockAddr}`)

  let subContract = await getContractInstance('Cybereits Team Lock')

  // 解锁锁定的代币
  let unlockResult = await subContract
    .methods
    .unlock(unlockAddr)
    .send({ from: deployOwnerAddr })
    .catch((err) => {
      throw new Error(err.message)
    })

  console.log(unlockResult)
  process.exit(0)
}
