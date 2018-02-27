import { TaskCapsule, ParallelQueue } from 'async-task-manager'

import Input from 'prompt-input'
import Checkbox from 'prompt-checkbox'
import web3 from '../framework/web3'
import { deployOwnerAddr, deployOwnerSecret } from '../config/const'
import Model from '../core/schemas'
import { getEthReturnBackInfo, syncReturnBackTransactionSentStatus } from '../apis/phpApis'

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

  console.log('从服务器获取本次要发送的用户信息...')

  // fetch return info from server
  let data = await getEthReturnBackInfo()
    .catch((err) => {
      console.log(err)
      process.exit(-1)
    })

  data.forEach((entity) => {
    queue.add(new TaskCapsule(() => new Promise(async (resolve, reject) => {
      let dataToSave = {
        refId: entity.id,
        address: entity.address,
        amount: entity.amount,
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
        let savedData = await userReturnBackModel.create(dataToSave).catch(reject)
        validData.push(savedData)
        resolve()
      }
    })))
  })

  queue.consume()
})

const init = async (fetchDataFromServer, status) => {
  connect = await web3.onWs

  if (fetchDataFromServer) {
    transInfo = await prepareTransInfo()
  } else {
    transInfo = await userReturnBackModel.find({ status: +status })
  }

  walletAddress = await sendWalletPrompt.run()
    .catch(errLogAndExit)

  walletSecret = await sendWalletPwdPrompt.run()
    .catch(errLogAndExit)

  return transInfo
}

const main = async (source = 'server', status = 0) => {

  let transInfo = await init(source === 'server', status)

  if (transInfo && transInfo.length > 0) {

    walletAddress = (walletAddress && walletAddress.trim()) || deployOwnerAddr
    walletSecret = (walletSecret && walletSecret.trim()) || deployOwnerSecret

    let ignoreTransactions = await new Checkbox({
      name: 'chosen',
      message: '选择本次要忽略的交易',
      choices: transInfo.map(({ name, address, amount }) => `姓名:${name}\t\t数量: ${amount}\t\t钱包地址: ${address}`),
    })
      .run()
      .catch(errLogAndExit)

    // 忽略掉的交易
    let ignoreTrans = transInfo.filter(({ address }) => ignoreTransactions.filter(str => str.indexOf(address) > -1).length > 0)

    // 保存忽略的交易的状态
    ignoreTrans.forEach(({ _id }) => userReturnBackModel
      .findByIdAndUpdate(_id, { status: -1 })
      .catch((err) => { console.log(`标记忽略失败: ${_id} ${err}`) }))

    // 过滤掉忽略的交易
    transInfo = transInfo.filter(({ address }) => ignoreTransactions.filter(str => str.indexOf(address) > -1).length === 0)

    let confirm = new Input({
      name: 'confirm',
      message: `
        确认 [输入 Y 确认, 任意键取消]
        转出钱包地址: ${walletAddress}
        共计: ${transInfo.length} 笔
        -------------------------
        ${transInfo.map(({ name, address, amount }) => `姓名:${name}\t\t数量: ${amount}\t\t钱包地址: ${address}`).join('\n')}
      `,
    })

    let confirmEnter = await confirm.run()
      .catch(errLogAndExit)

    if (confirmEnter && confirmEnter.toLowerCase() === 'y') {
      statistics.total += transInfo.length

      let succCollection = []

      let queue = new ParallelQueue({
        limit: 1,
        toleration: 0,
        onFinished: async () => {
          if (transInfo.length > succCollection.length) {
            console.warn(`共执行 ${transInfo.length} 笔转账,确认成功发出的只有 ${succCollection.length} 笔,请手动核实!!!`)
            process.exit(-1)
          }

          let continueConfirm = new Input({
            name: 'continue',
            message: `
              同步发送结果完成!
              成功转账:
              --------------------------------------------------------------------------------------------
              钱包地址\t\t\t\t\t\t数量\t\ttxid
              --------------------------------------------------------------------------------------------
              ${succCollection.map(({ address, amount, txid }) => `${address}\t${amount}\t\t${txid}`).join('\n')}
              --------------------------------------------------------------------------------------------
              继续? [输入 Y 确认，任意键取消]
            `,
          })

          let continueResult = await continueConfirm
            .run()
            .catch(errLogAndExit)

          if (continueResult && continueResult.toLowerCase() === 'y') {
            main(source, status)
          } else {
            logResult()
            process.exit(0)
          }
        },
      })

      if (transInfo.length > 0) {
        await syncReturnBackTransactionSentStatus(transInfo.map(t => t.refId))
          .catch((err) => {
            console.error(`同步退还代币交易状态失败: ${err}`)
          })
      }

      transInfo.forEach(({ _id, name, address, amount }) =>
        queue.add(new TaskCapsule(() => new Promise(async (resolve, reject) => {
          await userReturnBackModel
            .findByIdAndUpdate(_id, { status: 1 })
            .catch((err) => { console.log(`标记已发送状态失败: ${_id} ${err}`) })

          console.log(`开始发送 姓名: ${name} 钱包地址: ${address} amount: ${amount}`)
          connect
            .eth
            .personal
            .sendTransaction({
              from: walletAddress,
              to: address,
              value: connect.eth.extend.utils.toWei(amount.toString(), 'ether'),
            }, walletSecret)
            .then(async (txid) => {
              console.log(`发送成功 钱包地址: ${address} 数量: ${amount} txid: ${txid}`)
              await userReturnBackModel
                .findByIdAndUpdate(_id, { status: 2, txid })
                .catch((err) => { console.log(`标记成功状态失败: ${_id} ${err}`) })
              succCollection.push({
                address,
                amount,
                txid,
              })
              sentTransactions.push(txid)
              statistics.succ += 1
              resolve()
            })
            .catch(async (err) => {
              await userReturnBackModel
                .findByIdAndUpdate(_id, { status: -2 })
                .catch((_err) => { console.log(`标记成功状态失败: ${_id} ${_err}`) })
              console.error(err)
              reject(err)
            })
        }))))

      queue.consume()
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
