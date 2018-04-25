import { TaskCapsule, ParallelQueue } from 'async-task-manager'

import { postBalances } from '../../apis/phpApis'
import { connect } from '../../framework/web3'

export default async function syncWallet() {
  let list = await connect.eth.getAccounts()
  let balanceArr = []
  let total = 0

  const taskQueue = new ParallelQueue({ limit: 20, toleration: 0 })

  if (list.length > 0) {
    for (let i = 0; i < list.length; i += 1) {
      taskQueue.add(
        new TaskCapsule(() =>
          new Promise(async (resolve, reject) => {
            let address = list[i]
            let amount_wei = await connect.eth.getBalance(address).catch(reject)
            let amount = connect.eth.extend.utils.fromWei(amount_wei, 'ether')
            total += +amount
            balanceArr.push({ address, amount })
            resolve('succ')
          })
        )
      )
    }

    taskQueue
      .consume()
      .then(() => {
        console.log(`总币量${total} 总地址数${balanceArr.length}`)
        postBalances(balanceArr)
          .then((res) => {
            console.log(`钱包信息查询完毕，提交到 php 服务器: ${JSON.stringify(res, null, 4)}`)
          })
          .catch((err) => {
            console.log(`任务队列执行错误: ${err.message}`)
          })
      })
      .catch((err) => {
        console.log(err)
      })
  } else {
    throw new Error('地址数组为空')
  }
}
