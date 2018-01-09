import web3 from '../framework/web3'
import {
  deployOwnerAddr,
  deployOwnerSecret,
} from '../config/const'
import { unlockAccount } from '../server/utils/basic'

export default async (
  amount = 10,
) => {
  let connect = await web3.onWs
  await unlockAccount(connect, deployOwnerAddr, deployOwnerSecret)
  connect
    .eth
    .personal
    .sendTransaction({
      from: deployOwnerAddr,
      to: '0x64191BC7B3561f7a790A1c8861B8cA6D54275a80',
      value: connect.eth.extend.utils.toWei(amount, 'ether'),
    }, deployOwnerSecret)
    .then((res) => {
      console.log('success!')
      process.exit(0)
    })
    .catch((err) => {
      console.error(err)
      process.exit(-1)
    })
}
