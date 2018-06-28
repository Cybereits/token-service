import { TaskCapsule, ParallelQueue } from 'async-task-manager'

import { getAllAccounts, updateBalanceOfAccount } from '../../core/scenes/account'
import { getAllTokenContracts } from '../../core/scenes/contract'

let executable = true

export async function updateAllAccounts(tokenContractNames) {
  const taskQueue = new ParallelQueue({ limit: 20 })

  let accounts = await getAllAccounts()

  accounts.forEach((address) => {
    taskQueue.add(new TaskCapsule(() => updateBalanceOfAccount(address)))
    tokenContractNames.forEach((contractName) => {
      taskQueue.add(new TaskCapsule(() => updateBalanceOfAccount(address, contractName)))
    })
  })

  return taskQueue.consume()
}

export default async function (job, done) {
  if (!executable) {
    console.info('尚有未完成交易状态同步任务...')
    done()
  }

  console.log('开始同步账户余额')
  executable = false
  const tokenContractNames = await getAllTokenContracts().then(res => res.map(({ name }) => name))

  updateAllAccounts(tokenContractNames)
    .then(() => {
      executable = true
      done()
      console.info('系统账户余额信息更新完成')
    }).catch((ex) => {
      executable = true
      console.error(ex.message)
      done()
    })
}
