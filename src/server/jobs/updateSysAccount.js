import { TaskCapsule, ParallelQueue } from 'async-task-manager'

import { getAllAccounts, updateBalanceOfAccount } from '../../core/scenes/account'
import { getAllTokenContracts } from '../../core/scenes/contract'

getAllAccounts().then(async (accounts) => {
  const taskQueue = new ParallelQueue({ limit: 20 })
  const tokenContractNames = await getAllTokenContracts().then(res => res.map(({ name }) => name))
  accounts.forEach((address) => {
    taskQueue.add(new TaskCapsule(() => updateBalanceOfAccount(address)))
    tokenContractNames.forEach((contractName) => {
      taskQueue.add(new TaskCapsule(() => updateBalanceOfAccount(address, contractName)))
    })
  })

  taskQueue.consume().then(() => {
    console.info('系统账户余额信息更新完成')
  }).catch((ex) => {
    console.error(ex.message)
  })
})
