import { TaskCapsule, ParallelQueue } from 'async-task-manager'

import { postTransactions } from '../../apis/phpApis'
import { getEthBalance, getTokenBalance } from '../../core/scenes/token'

let executable = true

// 同步交易记录时每次交易数量的限制
const step = 50

// 提交信息的并行任务数量限制
const postParallelLimitation = 2

/**
 * 扫描区块查询账户下的 transactions
 * @param {*} eth 钱包客户端链接
 * @param {*} accounts 钱包地址数组
 * @param {*} startBlockNumber 扫描起始区块高度
 */
function getTransactionsByAccounts(eth, accounts, startBlockNumber = 0) {
  return new Promise((resolve, reject) => {

    let transactionSet = new Set(accounts)

    // 扫描区块的任务队列
    // 由于获取区块时并发数量过高会导致 missing trie node 错误
    // 所以限制区块扫描任务并发数量不得超过 30
    // let taskQueue = new ParallelQueue({
    //   limit: 30,
    //   toleration: 0,
    // })

    // 钱包信息任务队列
    // 由于获取钱包账户信息时并发数量过高会导致 missing trie node 错误
    // 所以限制任务并发数量不得超过 30
    let accountsQueue = new ParallelQueue({
      limit: 10,
      toleration: 0,
    })

    accounts.map(_addr => accountsQueue.add(new TaskCapsule(() =>
      new Promise(async (resolve, reject) => {

        let ethBalance = await getEthBalance(_addr).catch(reject)

        let creBalance = await getTokenBalance(_addr).catch(reject)

        transactionSet[_addr] = {
          address: _addr,
          eth: ethBalance,
          cre: creBalance,
          trans: [],
        }

        resolve()
      }))))

    accountsQueue
      .consume()
      .then(() => {
        resolve(transactionSet)
      })
      .catch(reject)
  })
}

/**
 * 同步 transaction 信息
 * @param {*} info 要同步的信息体
 * @param {function} callback 整体完成后的回调函数
 */
function submitTransInfo(info, callback) {

  let transLength = info.trans.length // 记录该地址下交易记录的总长度
  let start = 0 // 发送的交易的起始位置
  let end = step  // 发送交易的截止位置

  // 每个地址下对应交易记录同步任务的并行队列
  let queue = new ParallelQueue({
    limit: 1,
    toleration: 0,
    onFinished: callback,
  })

  // 由于同步信息时如果交易记录很多就会超出 post 请求的限制
  // 所以对于每个地址的交易记录，每次只同步 30 条
  // 不同的地址可以并发同步 但是相同地址每次只能有一个同步请求 完成后才会继续同步接下来的 30 条交易记录
  do {
    // 临时记录任务执行时的交易记录区间
    let _start = start
    let _end = end

    // 创建同步的任务
    queue.add(new TaskCapsule(() => new Promise((resolve, reject) => {
      // 获取本此同步的交易记录
      let _trans = info.trans.slice(_start, _end)
      // 生成同步的数据体
      let data = Object.assign({}, info, { trans: _trans })
      // 同步数据
      postTransactions(data)
        .then((res) => {
          if (+res.code === 0) {
            // 同步成功
            console.log(`同步成功，地址: ${info.address}`)
            resolve()
          } else {
            // 同步失败
            reject(new Error(res.msg))
          }
        })
        .catch(() => {
          console.error('同步钱包交易信息失败')
          resolve()
        })
    })))
    start += step
    end += step
  }
  while (start < transLength) // 一次行生成该地址下所有的同步任务
  queue.consume() // 执行同步任务队列
}

export default conn => async () => {
  if (!executable) {
    console.info('尚有未完成钱包同步任务...')
  }
  executable = false
  // 只扫描最近的 300 个区块
  let currentHeight = await conn.eth.getBlockNumber()
  let startBlockNumber = currentHeight - 300

  let accounts = await conn.eth.getAccounts().catch((err) => {
    console.error(`获取本地账户信息失败: ${err.message}`)
  })

  if (!accounts) {
    executable = true
    return
  }

  let transCollection = await getTransactionsByAccounts(conn.eth, accounts, startBlockNumber, currentHeight, false)
    .catch((err) => {
      console.error(err)
      return false
    })

  if (!transCollection) {
    executable = true
    return
  }

  console.log(`共计 ${transCollection.size} 个钱包账户:`)

  let submitQueue = new ParallelQueue({
    limit: postParallelLimitation,
    toleration: 0,
  })

  transCollection
    .forEach((address) => {
      submitQueue.add(new TaskCapsule(() => new Promise((endResolve) => {
        // 获取钱包地址的详细信息
        let detail = transCollection[address]
        // 没有交易记录的账户
        // 直接提交账户余额等信息
        submitTransInfo(detail, endResolve)
      })))
    })

  submitQueue
    .consume()
    .then(() => {
      executable = true
    })
    .catch(() => {
      executable = true
    })
}
