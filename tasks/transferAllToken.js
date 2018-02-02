import BN from 'bignumber.js'
import schedule from 'node-schedule'

import web3 from '../framework/web3'
import { deployOwnerAddr, deployOwnerSecret } from '../config/const'
import { getTokenBalance, sendToken } from '../utils/coin'

export default async (
  gatherAddress,
  targetAddress = deployOwnerAddr,
  targetAddrSecret = deployOwnerSecret,
  fromAddress = deployOwnerAddr,
  fromAddrSecret = deployOwnerSecret,
) => {
  console.assert(gatherAddress, '归集地址不能为空!')

  let connect = await web3.onWs

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

  let txCost = gPrice.mul(gUsed)
  let transAmount = txCost

  console.log(`
  账户余额\t${total.toString(10)}\n
  油费\t${gPrice.toString(10)}\n
  用量\t${gUsed.toString(10)}\n
  总花费\t${txCost.toString(10)}\n
  实际发送数量\t${transAmount.toString(10)}\n
  `)

  let txid = await connect
    .eth
    .personal
    .sendTransaction({
      from: fromAddress,
      to: targetAddress,
      value: transAmount,
      gas: gUsed.toString(10),
      gasPrice: gPrice.toString(10),
    }, fromAddrSecret)
    .catch((err) => {
      console.error(err)
      process.exit(-1)
    })

  let creAmount = await getTokenBalance(targetAddress)
    .catch((ex) => {
      console.error(`get address eth balance failded: ${targetAddress}`)
      process.exit(-1)
    })

  console.log(`发送油费成功 ${txid}\n准备回收 ${targetAddress} 下 ${creAmount} 枚代币至 ${gatherAddress}`)

  schedule.scheduleJob('*/5 * * * * *', async () => {
    console.log('执行检验...')
    let ethAmount = await connect.eth.getBalance(targetAddress)
    if (+ethAmount >= +transAmount.toString(10)) {
      console.log('检验成功,油费已到账,执行归集...')
      sendToken(targetAddress, targetAddrSecret, gatherAddress, creAmount, gUsed.toString(10), gPrice.toString(10))
        .then((res) => {
          console.log('归集成功!')
          console.log(res)
          setTimeout(() => {
            process.exit(0)
          }, 3000)
        })
        .catch((err) => {
          console.error(err)
          process.exit(-1)
        })
    } else {
      console.log('归集执行账户油钱尚未到账，取消本次归集操作')
    }
  })
}
