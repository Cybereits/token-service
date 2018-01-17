import {
  getERC20TokenAccountBalance,
} from '../apis/etherscanApis'

import {
  getDistributeSentInfo,
  syncTokenSendingSucc,
} from '../apis/phpApis'

import { SerialQueue, TaskCapsule } from '../utils/task'

export default async () => {
  // 获取已经发送过的地址信息
  let sentAddressArray = await getDistributeSentInfo()
    .catch((err) => {
      console.error(`获取已经分发的账户信息失败：${err.message}`)
    })

  if (sentAddressArray && sentAddressArray.length > 0) {
    // 克隆一份地址
    let succAddress = sentAddressArray.slice()

    // 创建校验任务队列
    let queue = new SerialQueue({
      abortAfterFail: false,
      toleration: 0,
      onFinished: () => {
        console.log(`队列执行完成, 同步地址：${succAddress.length} address:${succAddress}`)
        if (succAddress.length > 0) {
          syncTokenSendingSucc(succAddress)
            .catch((err) => {
              console.error(`同步发送成功状态失败：${err.message}`)
            })
        }
      },
    })

    sentAddressArray
      .forEach((address) => {
        queue.add(
          new TaskCapsule(() =>
            new Promise((resolve, reject) => {
              getERC20TokenAccountBalance(address)
                .then((res) => {
                  if (res.status === '1') {
                    if (+res['result'] > 0) {
                      console.log(`${address} 账户已经收到 ${+res['result']} 枚代币`)
                    } else {
                      console.info(`${address} 账户尚未收到代币.`)
                      succAddress = succAddress.filter(addr => addr !== address)
                    }
                  } else {
                    console.warn(`请求 etherscan 接口失败 ${JSON.stringify(res, null, 4)}`)
                    succAddress = succAddress.filter(addr => addr !== address)
                  }
                  resolve()
                })
                .catch((err) => {
                  reject(`请求 etherscan 接口失败: ${err.message}`)
                })
            })
          )
        )
      })

    queue.consume()

  } else {
    console.error('获取已经分发的账户信息无效')
    process.exit(0)
  }
}
