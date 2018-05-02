import { TaskCapsule, ParallelQueue } from 'async-task-manager'

import { connect } from '../framework/web3'
import { getTokenBalance } from '../core/scenes/token'

let taskQueue = new ParallelQueue({
  limit: 3,
  onFinished: () => {
    console.log('-'.repeat(100))
    process.exit(0)
  },
})

async function getBalance() {
  let listAccounts = await connect.eth.getAccounts()
  listAccounts.forEach((address) => {
    taskQueue.add(new TaskCapsule(() =>
      new Promise(async (resolve, reject) => {
        let amount = await connect.eth.getBalance(address)
          .catch((ex) => {
            console.error(`get address eth balance failded: ${address}`)
            reject(ex)
          })
        let creAmount = await getTokenBalance(address)
          .catch((ex) => {
            console.error(`get address eth balance failded: ${address}`)
            reject(ex)
          })
        let ethAmount = connect
          .eth
          .extend
          .utils
          .fromWei(amount, 'ether')
          .toString()
          .split('')
          .concat(new Array(30).fill(' '))
          .slice(0, 30)
          .join('')
        console.log(`${address}\t${ethAmount}\t${creAmount}`)
        resolve()
      })
    ))
  })
  console.log('-'.repeat(100))
  console.log('钱包地址\t\t\t\t\teth 余额\t\t\tcre 余额')
  console.log('-'.repeat(100))
  taskQueue.consume()
}

export default getBalance
