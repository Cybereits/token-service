const request = require('../../framework/request').default
const web3 = require('../../framework/web3').default
const { TaskCapsule, ParallelQueue } = require('../utils/task')
const config = require('../../config/env')
const { etherScanApi, apikey } = require('../../config/const')

let transactionList = []
let count = 0

async function getListAccounts() {
  let connect = await web3.onWs
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
    console.log(`${config.apiServer}/trans`)
    request.post(`${config.apiServer}/trans`, {
      'data': transactionList,
    })
      .then((res) => {
        console.log(`${config.apiServer}/trans: ${res}`)
        process.exit(0)
      })
      .catch((err) => {
        console.log(err)
        process.exit(0)
      })
  },
})

function getTransaction(address) {
  return request.get(etherScanApi, {
    module: 'account',
    action: 'txlist',
    address: address,
    startblock: 0,
    endblock: 99999999,
    page: 1,
    offset: 100,
    sort: 'asc',
    apikey: apikey,
  })
}

async function getListTransaction() {
  let connect = await web3.onWs
  let listAccounts = await getListAccounts()
  let list = listAccounts.listAccounts
  transactionList = []
  console.log(`地址数量为${list.length}`)
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

getListTransaction()
