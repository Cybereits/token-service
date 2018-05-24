import { sendToken } from '../core/scenes/token'

export default (
  toAddress,
  amount,
  fromAddress,
  secret
) => {
  console.assert(toAddress, '接收地址不能为空!')
  console.assert(!!amount && !isNaN(+amount) && +amount > 0, '转账数量必须为有效数值!')

  sendToken(fromAddress, secret, toAddress, amount)
    .then((res) => {
      console.log(`Sent succeed, txid:${res}`)
      process.exit(0)
    })
    .catch((err) => {
      console.error(err)
      process.exit(-1)
    })
}
