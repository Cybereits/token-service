import Input from 'prompt-input'

import web3 from '../framework/web3'
import { deployOwnerAddr, deployOwnerSecret } from '../config/const'
import Model from '../server/schemas'
import { ParallelQueue, TaskCapsule } from '../utils/task'
import { getReturnBackInfo, submitReturnBackSendResult } from '../apis/phpApis'

const userReturnBackModel = Model.userReturnBackInfo()

// 已发送过的地址
let sentTransactions = []
let connect
let walletAddress
let walletSecret
let transInfo
let statistics = {
  total: 0,
  succ: 0,
}

let sendWalletPrompt = new Input({
  name: 'wallet address',
  message: '输入转出的钱包地址 [可默认]',
})

let sendWalletPwdPrompt = new Input({
  name: 'wallet secret',
  message: '输入转出的钱包秘钥 [可默认]',
})

const logResult = () => {
  console.info(`[统计结果]\n共发送:${statistics.total} 成功:${statistics.succ}`)
  console.info(`本次进程中交易发送的 txid 列表:
------------------------
${sentTransactions.join('\n')}
------------------------  
`)
}

const errLogAndExit = (err) => {
  if (err) {
    console.error(err)
  }
  logResult()
  process.exit(-1)
}

const prepareTransInfo = () => new Promise(async (resolve) => {

  let validData = []
  let queue = new ParallelQueue({
    limit: 1,
    onFinished: () => resolve(validData),
  })

  // fetch return info from server
  let data = await getReturnBackInfo()
    .catch((err) => {
      console.log(err)
      process.exit(-1)
    })

  data.forEach((entity) => {
    queue.add(new TaskCapsule(() => new Promise(async (resolve, reject) => {
      let dataToSave = {
        refId: entity.id,
        regAddress: entity.reg_address,
        sysAddress: entity.sys_address,
        regAmount: entity.reg_amount,
        acceptAmount: entity.accept_amount,
        receiveAmount: entity.receive_amount,
        returnAmount: entity.return_amount,
        name: entity.name,
        email: entity.email,
        mobile: entity.mobile,
        coinType: entity.coin_type,
        status: 0,
        txid: '',
      }
      let existEntity = await userReturnBackModel.findOne({ refId: dataToSave.refId })
      if (existEntity) {
        console.log(`用户 ${dataToSave.name} 数据重复获取，已忽略`)
        resolve()
      } else {
        await userReturnBackModel.create(dataToSave).catch(reject)
        validData.push(dataToSave)
        resolve()
      }
    })))
  })

  queue.consume()
})

const init = async () => {
  connect = await web3.onWs

  transInfo = await prepareTransInfo()

  walletAddress = await sendWalletPrompt.run()
    .catch(errLogAndExit)

  walletSecret = await sendWalletPwdPrompt.run()
    .catch(errLogAndExit)

  return transInfo.map(({ name, regAddress, returnAmount }) => ({ name, address: regAddress, amount: (+returnAmount).toFixed(2) }))
}

const main = async () => {

  let transColl = await init()

  if (transColl && transColl.length > 0) {

    walletAddress = (walletAddress && walletAddress.trim()) || deployOwnerAddr
    walletSecret = (walletSecret && walletSecret.trim()) || deployOwnerSecret

    // console.log(trans)

    let confirm = new Input({
      name: 'confirm',
      message: `确认 [输入 Y 确认, 任意键取消]
      转出钱包地址: ${walletAddress}
      共计: ${transColl.length} 笔
      -------------------------
      ${transColl.map(({ address, amount }) => `  姓名:${name}\t\t数量: ${amount}\t\t钱包地址: ${address}`).join('\n')}`,
    })

    let confirmEnter = await confirm.run()
      .catch(errLogAndExit)

    if (confirmEnter && confirmEnter.toLowerCase() === 'y') {
      statistics.total += transColl.length

      let succCollection = []

      let submitResult = () => {
        if (transColl.length > succCollection.length) {
          console.warn(`共执行${transColl.length}笔转账,确认成功发出的只有${succCollection.length}笔,请手动核实!!!`)
          console.log('同步发送结果...请稍后')
          submitReturnBackSendResult(succCollection)
            .then(() => { errLogAndExit() })
            .catch(errLogAndExit)
        } else {
          console.log('同步发送结果...请稍后')
          submitReturnBackSendResult(succCollection)
            .then(async () => {
              let continueConfirm = new Input({
                name: 'continue',
                message: `同步发送结果完成!
              成功转账:
              --------------------------------------------------------------------------------------------
              钱包地址\t\t\t\t\t\t数量\t\ttxid
              --------------------------------------------------------------------------------------------
              ${succCollection.map(({ address, amount, txid }) => `${address}\t${amount}\t\t${txid}`).join('\n')}
              --------------------------------------------------------------------------------------------
              继续? [输入 Y 确认，任意键取消]`,
              })
              let continueResult = await continueConfirm
                .run()
                .catch(errLogAndExit)

              if (continueResult && continueResult.toLowerCase() === 'y') {
                main()
              } else {
                logResult()
                process.exit(0)
              }
            })
            .catch(errLogAndExit)
        }
      }

      let proms = transColl.map(({ name, address, amount }) =>
        new Promise((resolve, reject) => {
          console.log(`开始发送 姓名: ${name} 钱包地址: ${address} amount: ${amount}`)
          connect
            .eth
            .personal
            .sendTransaction({
              from: walletAddress,
              to: address,
              value: connect.eth.extend.utils.toWei(amount, 'ether'),
            }, walletSecret)
            .then((txid) => {
              console.log(`发送成功 钱包地址: ${address} 数量: ${+(+amount).toFixed(2)} txid: ${txid}`)
              succCollection.push({
                address,
                amount,
                txid,
              })
              sentTransactions.push(txid)
              statistics.succ += 1
              resolve()
            })
            .catch((err) => {
              reject(err)
            })
        }))

      Promise
        .all(proms)
        .then(submitResult)
        .catch((err) => {
          console.error(err)
          submitResult()
        })
    } else {
      console.warn('交易取消，进程退出...')
      logResult()
      process.exit(0)
    }
  } else {
    console.warn('没有需要发送的地址，进程退出...')
    logResult()
    process.exit(0)
  }
}

export default main
