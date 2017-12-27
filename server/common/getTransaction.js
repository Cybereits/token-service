require('babel-register')({
  presets: ['es2015', 'stage-0'],
})

const request = require('../../framework/request').default
const web3 = require('../../framework/web3').default
const Task = require('./task').default
const config = require('../../config/env')

const etherScanApi = 'https://api.etherscan.io/api'
const apikey = 'JZ32792P5A6BD4RDAPK7XZ6P21PFRWWXDS'

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

const taskQueue = new Task.ParallelQueue(() => {
  console.log(`查询成功的地址数量为${count}`)
  console.log(`共有${transactionList.length}条交易记录`)
  console.log(`${config.apiServer}/trans`)
  request.post(`${config.apiServer}/trans`, {
    'data': transactionList,
  })
    .then((res) => {
      console.log(`${config.apiServer}/trans: ${res}`)
    })
    .catch((err) => { console.log(err) })
})

function getTransaction(address) {
  return request.get(etherScanApi, {
    module: 'account',
    action: 'txlist',
    address: address,
    startblock: 0,
    endblock: 99999999,
    page: 1,
    offset: 10,
    sort: 'asc',
    apikey: apikey,
  })
}

async function getListTransaction() {
  let connect = await web3.onWs
  // let listAccounts = await getListAccounts()
  let list = ['0x3ac3d18f3b72bc68644633076925aee187d385f1', '0x39d9f4640b98189540A9C0edCFa95C5e657706aA']
  // let list = listAccounts.listAccounts
  transactionList = []
  console.log(`地址数量为${list.length}`)
  for (let i = 0; i < list.length; i += 1) {
    taskQueue.add(
      new Task.TaskCapsule(() =>
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
            .catch(reject)),
      ),
    )
  }
  taskQueue.consume()
}

getListTransaction()
