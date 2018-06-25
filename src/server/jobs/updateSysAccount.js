import { TaskCapsule, ParallelQueue } from 'async-task-manager'

import { getAllAccounts, updateBalanceOfAccount } from '../../core/scenes/account'
import { getAllTokenContracts } from '../../core/scenes/contract'

let executable = true

export default async function (job, done) {
  if (!executable) {
    console.info('尚有未完成交易状态同步任务...')
    done()
  }

  executable = false

  const tokenContractNames = await getAllTokenContracts().then(res => res.map(({ name }) => name))
  const taskQueue = new ParallelQueue({ limit: 20 })

  getAllAccounts()
    .then(async (accounts) => {

      accounts.forEach((address) => {
        taskQueue.add(new TaskCapsule(() => updateBalanceOfAccount(address)))
        tokenContractNames.forEach((contractName) => {
          taskQueue.add(new TaskCapsule(() => updateBalanceOfAccount(address, contractName)))
        })
      })

      taskQueue.consume().then(() => {
        executable = true
        done()
        console.info('系统账户余额信息更新完成')
      }).catch((ex) => {
        executable = true
        console.error(ex.message)
        done()
      })
    })
    .catch((ex) => {
      executable = true
      console.error(ex.message)
      done()
    })
}
