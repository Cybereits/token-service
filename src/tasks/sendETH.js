import { ethWalletConnect } from '../framework/web3'

import {
  deployOwnerAddr,
  deployOwnerSecret,
} from '../config/const'

export default async (
  toAddress,
  amount,
  fromAddress = deployOwnerAddr,
  secret = deployOwnerSecret,
) => {
  console.assert(toAddress, '接收地址不能为空!')
  console.assert(!!amount && !isNaN(+amount) && +amount > 0, '转账的 eth 数量必须为有效数值!')

  ethWalletConnect
    .eth
    .personal
    .sendTransaction({
      from: fromAddress,
      to: toAddress,
      value: ethWalletConnect.eth.extend.utils.toWei(amount, 'ether'),
    }, secret)
    .then((res) => {
      console.log('success!')
      console.log(res)
    })
    .catch((err) => {
      console.error(err)
    })
}
