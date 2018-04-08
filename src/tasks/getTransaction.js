import { TaskCapsule, ParallelQueue } from 'async-task-manager'

import { connect } from '../framework/web3'
import { postTransactions } from '../apis/phpApis'
import { getTransaction } from '../apis/etherscanApis'

let transactionList = []
let count = 0

async function getLocalAccounts() {
  let [listAccounts, code, msg] = [[], 200, '']
  try {
    code = 200
    listAccounts = await connect.eth.getAccounts()
  } catch (error) {
    code = -1
    msg = error.toString()
  }
  return {
    code,
    listAccounts,
    msg,
  }
}

const taskQueue = new ParallelQueue({
  onFinished: () => {
    console.log(`查询成功的地址数量为${count}`)
    console.log(`共有${transactionList.length}条交易记录`)
    postTransactions
      .then((res) => {
        console.log(`postTransactions response: ${JSON.stringify(res, null, 4)}`)
        process.exit(0)
      })
      .catch((err) => {
        console.log(err)
        process.exit(0)
      })
  },
})

async function getListTransaction() {
  let listAccounts = await getLocalAccounts()
  let list = listAccounts.listAccounts
  transactionList = []

  console.log(`本地地址数量为${list.length}`)

  if (list.length > 0) {

    for (let i = 0; i < list.length; i += 1) {
      taskQueue.add(
        new TaskCapsule(() =>
          new Promise((resolve, reject) =>
            getTransaction(list[i])
              .then((res) => {
                count += 1
                if (res.status !== '0' && res.result.length > 0) {
                  for (let i = 0; i < res.result.length; i += 1) {
                    transactionList.push({
                      txid: res.result[i].hash,
                      from: res.result[i].from,
                      to: res.result[i].to,
                      amount: connect.eth.extend.utils.fromWei(res.result[i].value, 'ether'),
                      block: res.result[i].blockNumber,
                    })
                  }
                  console.log(`${list[i]} 有${res.result.length}笔交易记录`)
                } else {
                  console.log(`${list[i]} 暂无交易记录`)
                }
                resolve('succ')
              })
              .catch(reject))
        )
      )
    }
    taskQueue.consume()
  } else {
    process.exit(0)
  }
}

export default getListTransaction
