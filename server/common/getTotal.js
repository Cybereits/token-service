import addr from '../../config/address.json'
import { etherScanApi, apikey } from '../../config/const'
import web3 from '../../framework/web3'
import { TaskCapsule, ParallelQueue } from '../utils/task'
import request from '../../framework/request'

let total = 0

const taskQueue = new ParallelQueue({
  onFinished: () => {
    console.log(`\n总币量 ${total}`)
    process.exit(0)
  },
})

function getBalance(address) {
  return request.get(etherScanApi, {
    module: 'account',
    action: 'balance',
    address: address,
    tag: 'latest',
    apikey: apikey,
  })
}

async function getTotal() {
  let connect = await web3.onWs
  for (let i = 0; i < addr.length; i += 1) {
    taskQueue.add(
      new TaskCapsule(() =>
        new Promise((resolve, reject) =>
          getBalance(addr[i])
            .then((res) => {
              if (res.status === '1') {
                let ether = connect.eth.extend.utils.fromWei(res.result, 'ether')
                console.log(`address : ${addr[i]} | balance : ${ether}`)
                total += (+connect.eth.extend.utils.fromWei(res.result, 'ether'))
              }
              resolve('succ')
            })
            .catch(reject))
      )
    )
  }
  taskQueue.consume()
}

getTotal()
