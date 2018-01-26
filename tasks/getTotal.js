import { TaskCapsule, ParallelQueue } from 'async-task-manager'

import addr from '../config/address.json'
import web3 from '../framework/web3'
import { getBalance } from '../apis/etherscanApis'

let total = 0

const taskQueue = new ParallelQueue({
  onFinished: () => {
    console.log(`\n总币量 ${total}`)
    process.exit(0)
  },
})

async function getTotal() {
  let connect = await web3.onWs
  if (addr.length > 0) {
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
                  resolve({
                    address: addr[i],
                    balance: ether,
                  })
                } else {
                  reject(new Error('请求 etherscan api 失败'))
                }
              })
              .catch(reject))
        )
      )
    }
    taskQueue.consume()
  } else {
    console.log('no tasks')
    process.exit(0)
  }
}

export default getTotal
