import {
  getDistributeTokenInfo,
  syncTokenSent,
} from '../apis/phpApis'

import { deployOwnerAddr, deployOwnerSecret } from '../config/const'
import { SerialQueue, TaskCapsule } from '../utils/task'
import { sendToken } from '../utils/coin'

export default async () => {

  // 获取本次要发送的代币账户信息
  let distributeAddrColl = await getDistributeTokenInfo()
    .catch((err) => {
      console.error(`获取分发账户信息失败：${err.message}`)
    })

  if (distributeAddrColl && distributeAddrColl.length > 0) {
    // 记录分发地址
    let sentAddr = distributeAddrColl.map(t => t.address)

    // 创建发送任务队列
    let queue = new SerialQueue({
      abortAfterFail: false,
      toleration: 0,
      onFinished: () => {
        console.log(`队列执行完成, 同步地址：${sentAddr.length} address:${sentAddr}`)
        if (sentAddr.length > 0) {
          syncTokenSent(sentAddr)
            .catch((err) => {
              console.error(`同步已发送状态失败：${err.message}`)
            })
        }
      },
    })

    // 添加发送代币任务
    distributeAddrColl
      .forEach(({ address, amount }) => {
        queue.add(
          new TaskCapsule(
            () => sendToken(deployOwnerAddr, deployOwnerSecret, address, amount)
              .catch((ex) => {
                console.log(`发送代币失败: ${ex.message} 移除 address: ${address} amount: ${amount}`)
                // 过滤掉失败的地址
                sentAddr = sentAddr.filter(t => t !== address)
              })
          )
        )
      })

    // 消费队列
    queue.consume()
  } else {
    console.error('获取到的分发账户信息无效')
    process.exit(0)
  }
}
