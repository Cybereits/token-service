import { SerialQueue, TaskCapsule } from 'async-task-manager'

import transferAllEth from './transferAllEth'

let addrList = [] // 获取要归集的地址
let handledAddrList = []

const logResult = () => {
  console.info(`

本次进程中归集的地址列表:
------------------------
${handledAddrList.join('\n')}
------------------------

`)
}

const errLogAndExit = (err) => {
  if (err) {
    console.error(err)
  }
  logResult()
  process.exit(-1)
}

export default async (gatherAddress, amount, secret) => {
  let _amount = +amount

  if (isNaN(_amount) || _amount <= 0) {
    _amount = 100
  }

  console.log(`本次处理数量为 ${_amount}\n`)

  let queue = new SerialQueue({
    toleration: 0,
    onFinished: () => {
      logResult()
      process.exit(0)
    },
  })

  addrList.forEach((addr) => {
    queue.add(new TaskCapsule(() => transferAllEth(gatherAddress, addr, secret).then(() => {
      handledAddrList.push(addr)
    }).catch(errLogAndExit)))
  })

  queue.consume()
}
