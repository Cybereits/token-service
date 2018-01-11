import {
  deployOwnerAddr,
  deployOwnerSecret,
} from '../config/const'

import { sendToken } from '../utils/coin'

export default (
  toAddress,
  amount,
  fromAddress = deployOwnerAddr,
  secret = deployOwnerSecret,
) => {
  console.assert(toAddress, '接收地址不能为空!')
  console.assert(!!amount && !isNaN(+amount) && +amount > 0, '转账数量必须为有效数值!')

  console.info('开始调用发送代币指令')

  sendToken(fromAddress, secret, toAddress, amount)
    .then((res) => {
      console.log('success!')
      console.log(res)
      process.exit(0)
    })
    .catch((err) => {
      console.error(err)
      process.exit(-1)
    })
}
