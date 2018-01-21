import web3 from '../framework/web3'
import { TaskCapsule, ParallelQueue } from '../utils/task'

let taskQueue = new ParallelQueue({
  limit: 3,
  onFinished: () => {
    console.log('finished!')
    process.exit(0)
  },
})

async function getBalance() {
  let connect = await web3.onWs
  let listAccounts = await connect.eth.getAccounts()
  listAccounts.forEach((address) => {
    taskQueue.add(new TaskCapsule(() =>
      new Promise((resolve, reject) => {
        connect.eth.getBalance(address)
          .then((amount) => {
            console.log(`钱包地址 ${address} eth 余额 ${connect.eth.extend.utils.fromWei(amount, 'ether')}`)
            resolve()
          })
          .catch((ex) => {
            console.error(`get address eth balance failded: ${address}`)
            reject(ex)
          })
      })
    ))
  })
  taskQueue.consume()
}

export default getBalance
