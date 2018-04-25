import { TaskCapsule, ParallelQueue, SerialQueue } from 'async-task-manager'

import { connect } from '../../framework/web3'
import { postTransactions } from '../../apis/phpApis'
import { getTokenBalance, decodeTransferInput } from '../../utils/token'
import { walletTransInfoModel, blockScanLogModel } from '../../core/schemas'

// 同步交易记录时每次交易数量的限制
const step = 50

// 提交信息的并行任务数量限制
const postParallelLimitation = 2

/**
 * 保存交易详情到本地
 * @param {object} data 地址交易详情
 */
async function saveTrans(data) {
  let { address, eth, cre, trans } = data
  let existEntity = await walletTransInfoModel.findOne({ address })
  if (existEntity) {
    existEntity.eth = eth
    existEntity.cre = cre
    let existTxids = existEntity.trans.map(t => t.txid)
    // 拼接并去重 transaction 集合
    trans.forEach((transaction) => {
      if (existTxids.indexOf(transaction.txid) === -1) {
        existTxids.push(transaction.txid)
        existEntity.trans.push(transaction)
      }
    })
    existEntity.save().catch((err) => {
      console.error(`save wallet transaction failed: ${err}`)
    })
  } else {
    walletTransInfoModel(data).save().catch((err) => {
      console.error(`save wallet transaction failed: ${err}`)
    })
  }
}

/**
 * 保存扫描日志
 * @param {number} blockNum 区块高度
 */
async function saveScanLog(blockNum) {
  let existEntity = await blockScanLogModel.findOne({ blockNum })
  if (!existEntity) {
    return blockScanLogModel
      .create({ blockNum })
      .save()
      .catch(() => { console.log(`区块${blockNum}重新扫描`) })
  } else {
    return true
  }
}

/**
 * 获取本地最后一次完成扫描的区块高度
 * 因为完成的高度不一定是连续的
 * 譬如：1,2,4
 * 这时候最后一个完成的区块高度应该是 2
 */
async function getScannedBlockNumbers() {
  return blockScanLogModel
    .find({}, { blockNum: 1 })
    .then(res => res.map(t => t.blockNum))
    .catch((err) => {
      console.error(`Scan log error:${err}`)
      process.exit(-1)
    })
}

/**
 * 扫描区块查询账户下的 transactions
 * @param {*} eth 钱包客户端链接
 * @param {*} accounts 钱包地址数组
 * @param {*} startBlockNumber 扫描起始区块高度
 * @param {*} endBlockNumber 扫描截止区块高度
 * @param {boolean} isContract 是否是合约地址
 * @param {boolean} force 强制重新扫描，通常是有新的地址添加进来之后要重新扫描区块
 */
function getTransactionsByAccounts(eth, accounts, startBlockNumber = 0, endBlockNumber, isContract, force = false) {
  return new Promise((resolve) => {

    let transactionSet = new Set(accounts)

    // 扫描区块的任务队列
    // 由于获取区块时并发数量过高会导致 missing trie node 错误
    // 所以限制区块扫描任务并发数量不得超过 30
    let taskQueue = new ParallelQueue({
      limit: 30,
      onFinished: () => {
        console.log('区块扫描完成，所有账户的交易记录匹配完毕!')
        // 区块扫描完成后
        resolve(transactionSet)
      },
    })

    // 钱包信息任务队列
    // 由于获取钱包账户信息时并发数量过高会导致 missing trie node 错误
    // 所以限制任务并发数量不得超过 30
    let accountsQueue = new ParallelQueue({
      limit: 30,
      onFinished: async () => {
        console.log('钱包地址信息扫描完毕...开始扫描区块')
        await scanBlock(force)
        // 钱包信息创建完成时 执行区块扫描任务队列
        taskQueue.consume()
      },
    })

    // 扫描区块获得每个地址下的 transacation 的 hash 列表
    let scanBlock = async function (force) {
      let scannedBlocks = await getScannedBlockNumbers()
      // eslint-disable-next-line
      for (let i = startBlockNumber; i <= endBlockNumber; i++) {
        if (force || !~scannedBlocks.indexOf(i)) {
          taskQueue.add(new TaskCapsule(() => new Promise(async (resolve, reject) => {
            if (i % 50 === 0) {
              console.log(`Searching block ${i}`)
            }
            let block = await eth.getBlock(i, true).catch(reject)
            if (block != null && block.transactions != null) {
              let updateAddr = []
              // 遍历区块内的交易记录
              let transQueue = new ParallelQueue({
                limit: 10,
                onFinished: () => {
                  let queue = new SerialQueue({
                    onFinished: () => {
                      // 无脑 resolve 存储失败下次会从当前位置开始扫描
                      saveScanLog(i)
                        .then(resolve)
                        .catch(resolve)
                    },
                  })

                  updateAddr.forEach((addr) => {
                    queue.add(
                      new TaskCapsule(() => saveTrans(transactionSet[addr]).catch(reject))
                    )
                  })

                  queue.consume()
                },
              })

              block
                .transactions
                .forEach(({ from: fromAddress, to, hash, value, input }) => {
                  // 如果该交易的转入或转出地址与指定钱包有任何一则匹配
                  // 则将该转账记录添加到对应钱包下的交易记录集合中
                  accounts.forEach((accountAddr) => {
                    if (fromAddress === accountAddr || to === accountAddr) {
                      transQueue.add(new TaskCapsule(() => new Promise(async (resolve, reject) => {
                        let {
                          from: fromAddress,
                          to,
                          cumulativeGasUsed,
                          gasUsed,
                          blockNumber,
                        } = await connect
                          .eth
                          .getTransactionReceipt(hash)
                          .catch((err) => {
                            console.error(`获取转账明细失败: ${err.message}`)
                            reject(err)
                          })

                        // 将交易详情信息添加到队列中
                        transactionSet[accountAddr].trans.push({
                          block: blockNumber,
                          txid: hash,
                          from: fromAddress,
                          to,
                          cumulativeGasUsed,
                          gasUsed,
                          ethTransferred: connect.eth.extend.utils.fromWei(value, 'ether'),
                          tokenTransferred: decodeTransferInput(input)[2] || 0,
                        })
                        updateAddr.push(accountAddr)
                        resolve()
                      })))
                    }
                  })
                })

              transQueue.consume()
            } else {
              resolve()
            }
          })))
        }
      }
    }

    accounts.map(_addr => accountsQueue.add(new TaskCapsule(() =>
      new Promise(async (resolve, reject) => {

        let ethBalance = await eth.getBalance(_addr)
          .catch((ex) => {
            console.log(`get address eth balance failded: ${_addr}`)
            reject(ex)
          })

        let creBalance = 0

        if (!isContract) {
          creBalance = await getTokenBalance(_addr)
            .catch((ex) => {
              console.log(`get address cre balance failded: ${_addr}`)
              reject(ex)
            })
        }

        // 从本地存储中读取已经生成过的 walletTransInfo
        let existEntity = await walletTransInfoModel.findOne({ address: _addr })

        transactionSet[_addr] = {
          address: _addr,
          eth: eth.extend.utils.fromWei(ethBalance, 'ether'),
          cre: creBalance,
          trans: (existEntity && existEntity.trans) || [],
        }

        resolve()
      }))))

    accountsQueue.consume()
  })
}

/**
 * 同步 transaction 信息
 * @param {*} info 要同步的信息体
 * @param {function} callback 整体完成后的回调函数
 */
function submitTransInfo(info, callback) {
  // 将扫描后的数据先存到本地
  saveTrans(info)

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
      console.log(`同步地址信息: ${info.address} 从 ${_start} 到 ${_end} 共计 ${_trans.length} 笔交易信息`)
      // 同步数据
      postTransactions(data)
        .then((res) => {
          if (+res.code === 0) {
            // 同步成功
            console.log(`同步成功，地址: ${info.address} 从 ${_start} 到 ${_end} 共计 ${_trans.length} 笔交易信息`)
            resolve()
          } else {
            // 同步失败
            reject(new Error(res.msg))
          }
        })
        .catch((err) => {
          // 同步时网络异常
          console.error(`同步钱包交易信息失败: ${err.message}`)
          reject(err)
        })
    })))
    start += step
    end += step
  }
  while (start < transLength) // 一次行生成该地址下所有的同步任务
  queue.consume() // 执行同步任务队列
}

export default async (job, done) => {
  let startBlockNumber = 5419800
  let endBlockNumber = await connect.eth.getBlockNumber()

  let accounts = await connect.eth.getAccounts()
    .catch((err) => {
      console.error(`获取本地账户信息失败: ${err.message}`)
      process.exit(0)
    })

  let transCollection = await getTransactionsByAccounts(connect.eth, accounts, startBlockNumber, endBlockNumber, false, false)

  console.log(`共计 ${transCollection.size} 个钱包账户:`)

  let submitQueue = new ParallelQueue({
    limit: postParallelLimitation,
    toleration: 1,
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

  submitQueue.consume().then(done).catch(done)
}
