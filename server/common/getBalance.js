require('babel-register')({
  presets: ['es2015', 'stage-0'],
})

const addr = require('./addr.js').default
const request = require('../../framework/request').default
const web3 = require('../../framework/web3').default
const Task = require('./task').default

const etherScanApi = 'https://api.etherscan.io/api'
const apikey = 'JZ32792P5A6BD4RDAPK7XZ6P21PFRWWXDS'

let total = 0

const taskQueue = new Task.ParallelQueue(() => {
  console.log(`总币量${total}`)
})

function getBalance(address) {
  return request.get(etherScanApi, {
    module: 'account',
    action: 'balance',
    address: address,
    tag:'latest',
    apikey: apikey,
  })
}

async function getTotal() {
  let connect = await web3.onWs
  for (let i = 0; i < addr.length; i += 1) {
    taskQueue.add(
      new Task.TaskCapsule(() =>
        new Promise((resolve, reject) =>
          getBalance(addr[i])
            .then((res) => {
              if (res.status === '1') {
                let ether = connect.eth.extend.utils.fromWei(res.result, 'ether')
                console.log(`address:${addr[i]},balance:${ether}`)
                total += (+connect.eth.extend.utils.fromWei(res.result, 'ether'))
              }
              resolve('succ')
            })
            .catch(reject)),
      ),
    )
  }
  taskQueue.consume()
}

getTotal()
