import { SerialQueue, TaskCapsule } from 'async-task-manager'

import { deployOwnerSecret } from '../config/const'
import { getEthGatherAddrList } from '../apis/phpApis'
import transferAllEth from './transferAllEth'

let handleAddrList = []

const logResult = () => {
  console.info(`

本次进程中归集的地址列表:
------------------------
${handleAddrList.join('\n')}
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

export default async (gatherAddress, amount, secret = deployOwnerSecret) => {
  let _amount = +amount

  if (isNaN(_amount) || _amount <= 0) {
    _amount = 100
  }

  console.log(`本次处理数量为 ${_amount}\n`)

  let addrList = await getEthGatherAddrList(_amount).catch(errLogAndExit)

  // let addrList = [
  //   '0x357d20f90365a1b783150161e6678B5Ff2ef4009',
  //   '0x2D4C38968CADa3138A1C10Fa3416C429c9b574b3',
  // ]

  let queue = new SerialQueue({
    toleration: 0,
    onFinished: () => {
      logResult()
      process.exit(0)
    },
  })

  addrList.forEach((addr) => {
    queue.add(new TaskCapsule(() => transferAllEth(gatherAddress, addr, secret).then(() => {
      handleAddrList.push(addr)
    }).catch(errLogAndExit)))
  })

  queue.consume()
}
