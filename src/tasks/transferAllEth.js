import BN from 'bignumber.js'

import { ethClientConnection as connect } from '../framework/web3'

BN.config({ DECIMAL_PLACES: 18 })

export default async (
  toAddress,
  fromAddress,
  secret,
  adjust = 0
) => {
  if (toAddress === fromAddress) {
    return
  }

  console.assert(toAddress, '接收地址不能为空!')

  let total = await connect.eth.getBalance(fromAddress).catch((ex) => {
    console.error(`get address eth balance failded: ${fromAddress}`)
    process.exit(-1)
  })

  let gPrice = await connect.eth.getGasPrice().catch((ex) => {
    console.error(`get gas price failded: ${fromAddress}`)
    process.exit(-1)
  })

  let gUsed = await connect.eth.estimateGas({ from: fromAddress }).catch((ex) => {
    console.error(`get estimate gas failded: ${fromAddress}`)
    process.exit(-1)
  })

  total = new BN(total)
  gPrice = new BN(gPrice)
  gUsed = new BN(gUsed)

  let txCost = gPrice.mul(gUsed).mul(100 + adjust).div(100)
  let transAmount = total.minus(txCost)

  console.log(`余额\t${
    connect.eth.extend.utils.fromWei(total.toString(10))
    } 油费\t${
    gPrice.toString(10)
    } 用量\t${
    connect.eth.extend.utils.fromWei(gUsed.toString(10))
    } 总花费\t${
    connect.eth.extend.utils.fromWei(txCost.toString(10))
    } 实际发送数量\t${
    connect.eth.extend.utils.fromWei(transAmount.toString(10))
    }`)

  return connect
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
