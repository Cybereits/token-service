import web3 from '../framework/web3'
import {
  deployOwnerAddr,
  deployOwnerSecret,
} from '../config/const'
import { unlockAccount } from '../server/utils/basic'

export default async (
  fromAddress,
  secret,
  toAddress,
  amount,
) => {
  console.assert(fromAddress, '转出地址不能为空!')
  console.assert(secret, '转出地址密码不能为空!')
  console.assert(toAddress, '转入地址不能为空!')
  console.assert(amount, '转账的 eth 数量不能为空!')
  let connect = await web3.onWs
  await unlockAccount(connect, deployOwnerAddr, deployOwnerSecret)
  connect
    .eth
    .personal
    .sendTransaction({
      from: fromAddress,
      to: toAddress,
      value: connect.eth.extend.utils.toWei(amount, 'ether'),
    }, secret)
    .then((res) => {
      console.log('success!')
      process.exit(0)
    })
    .catch((err) => {
      console.error(err)
      process.exit(-1)
    })
}
