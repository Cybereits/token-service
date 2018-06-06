import { SerialQueue, TaskCapsule, ParallelQueue } from 'async-task-manager'

import { creClientConnection as connect } from '../framework/web3'
import { getEthBalance } from '../core/scenes/token'
import transferAllEth from './transferAllEth'

export default async (gatherAddress, secret) => {
  let handledAddrList = []
  let addrList = []
  let taskQueue = new ParallelQueue({ limit: 20 })

  // 获取要归集的地址
  let list = await connect.eth.getAccounts()

  list.forEach((address) => {
    taskQueue.add(new TaskCapsule(() =>
      new Promise(async (resolve, reject) => {
        let ethAmount = await getEthBalance(address).catch((ex) => {
          console.error(`get address eth balance failded: ${address}`)
          reject(ex)
        })

        if (ethAmount > 0.001 && address !== gatherAddress) {
          console.log(`${address}\t${ethAmount}`)
          addrList.push(address)
        }

        resolve()
      })
    ))
  })

  taskQueue.consume()
    .then(() => {
      let queue = new SerialQueue({ toleration: 0 })

      addrList.forEach((addr) => {
        queue.add(
          new TaskCapsule(
            () => transferAllEth(gatherAddress, addr, secret)
              .then(() => {
                handledAddrList.push(addr)
              })
              .catch((err) => {
                console.info(`[${addr}] fail, ${err.message}`)
              })
          )
        )
      })

      queue
        .consume()
        .then(() => {
          console.info(`本次进程中归集的地址列表:\n------------------------\n${handledAddrList.join('\n')}\n------------------------`)
        })
    })
}
