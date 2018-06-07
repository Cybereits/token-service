import { TaskCapsule, ParallelQueue } from 'async-task-manager'

import { getAllAccounts } from '../../core/scenes/account'
import { getEthBalance, getTokenBalance } from '../../core/scenes/token'
import { ethAccountModel } from '../../core/schemas'

export default async function () {
  const Accounts = await getAllAccounts()
  const taskQueue = new ParallelQueue({ limit: 15 })

  for (let i = 0; i < Accounts.length; i += 1) {
    taskQueue.add(
      new TaskCapsule(() =>
        new Promise(async (resolve, reject) => {
          let address = Accounts[i]
          let ethAmount = await getEthBalance(address)
          let creAmount = await getTokenBalance(address)

          // 更新账户信息
          ethAccountModel.update(
            {
              account: address,
            },
            {
              $set: {
                creAmount,
                ethAmount,
              },
            })
            .then(resolve)
            .catch(reject)
        })
      )
    )
  }

  taskQueue
    .consume()
    .then(() => {
      console.info('系统账户余额信息更新完成')
    })
}
