import web3 from '../framework/web3'

import {
  deployOwnerAddr,
  deployOwnerSecret,
} from '../config/const'

import { unlockAccount } from '../utils/basic'

export default async (
  toAddress,
  amount,
  fromAddress = deployOwnerAddr,
  secret = deployOwnerSecret,
) => {
  console.assert(toAddress, '接收地址不能为空!')
  console.assert(!!amount && !isNaN(+amount) && +amount > 0, '转账的 eth 数量必须为有效数值!')
  console.assert(fromAddress, '转出地址不能为空!')
  let connect = await web3.onWs
  await unlockAccount(connect, fromAddress, secret)
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
