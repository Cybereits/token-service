import { TaskCapsule, ParallelQueue } from 'async-task-manager'

import { getAllAccounts, updateBalanceOfAccount } from '../../core/scenes/account'

getAllAccounts().then((accounts) => {
  const taskQueue = new ParallelQueue({ limit: 10 })

  accounts.forEach((address) => {
    taskQueue.add(new TaskCapsule(() => updateBalanceOfAccount(address)))
  })

  taskQueue.consume().then(() => {
    console.info('系统账户余额信息更新完成')
  }).catch((ex) => {
    console.error(ex.message)
  })
})
