import BN from 'bignumber.js'

import { ethWalletConnect } from '../framework/web3'

BN.config({
  DECIMAL_PLACES: 18,
})

export default async (
  toAddress,
  fromAddress,
  secret,
  adjust = 0
) => {
  console.assert(toAddress, '接收地址不能为空!')

  let total = await ethWalletConnect.eth.getBalance(fromAddress).catch((ex) => {
    console.error(`get address eth balance failded: ${fromAddress}`)
    process.exit(-1)
  })

  let gPrice = await ethWalletConnect.eth.getGasPrice().catch((ex) => {
    console.error(`get gas price failded: ${fromAddress}`)
    process.exit(-1)
  })

  let gUsed = await ethWalletConnect.eth.estimateGas({ from: fromAddress }).catch((ex) => {
    console.error(`get estimate gas failded: ${fromAddress}`)
    process.exit(-1)
  })

  total = new BN(total)
  gPrice = new BN(gPrice)
  gUsed = new BN(gUsed)

  let txCost = gPrice.mul(gUsed).mul(100 + adjust).div(100)
  let transAmount = total.minus(txCost)

  console.log(`账户余额\t${total.toString(10)}\n
油费\t${gPrice.toString(10)}\n
用量\t${gUsed.toString(10)}\n
总花费\t${txCost.toString(10)}\n
实际发送数量\t${transAmount.toString(10)}`)

  return ethWalletConnect
    .eth
    .personal
    .sendTransaction({
      from: fromAddress,
      to: toAddress,
      value: transAmount,
      gas: gUsed.toString(10),
      gasPrice: gPrice.toString(10),
    }, secret)
    .catch((err) => {
      console.error(err)
      throw err
    })
}
