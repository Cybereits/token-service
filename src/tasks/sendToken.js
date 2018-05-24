import {
  deployOwnerAddr,
  deployOwnerSecret,
} from '../config/const'

import { sendToken } from '../core/scenes/token'

export default (
  toAddress,
  amount,
  fromAddress = deployOwnerAddr,
  secret = deployOwnerSecret,
  gas,
  gasPrice,
) => {
  console.assert(toAddress, '接收地址不能为空!')
  console.assert(!!amount && !isNaN(+amount) && +amount > 0, '转账数量必须为有效数值!')

  sendToken(fromAddress, secret, toAddress, amount, gas, gasPrice)
    .then((res) => {
      console.log(`Sent succeed, txid:${res}`)
      process.exit(0)
    })
    .catch((err) => {
      console.error(err)
      process.exit(-1)
    })
}
