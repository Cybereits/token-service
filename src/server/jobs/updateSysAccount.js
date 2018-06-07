import { TaskCapsule, ParallelQueue } from 'async-task-manager'

import { getAllAccounts, updateBalanceOfAccount } from '../../core/scenes/account'

let executable = true

export default async function (job, done) {
  if (!executable) {
    console.info('尚有未完成交易状态同步任务...')
    done()
  }
  executable = false
  const Accounts = await getAllAccounts().catch((ex) => {
    console.error(ex.message)
    executable = true
    done()
  })
  const taskQueue = new ParallelQueue({ limit: 10 })

  Accounts.forEach((address) => {
    taskQueue.add(new TaskCapsule(() => updateBalanceOfAccount(address)))
  })

  taskQueue
    .consume()
    .then(() => {
      console.info('系统账户余额信息更新完成')
      executable = true
      done()
    })
    .catch((ex) => {
      console.error(ex.message)
      executable = true
      done()
    })
}
