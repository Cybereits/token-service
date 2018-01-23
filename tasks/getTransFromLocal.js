import web3 from '../framework/web3'
import { TaskCapsule, ParallelQueue } from '../utils/task'
import { postTransactions } from '../apis/phpApis'
import { getTokenBalance, decodeTransferInput } from '../utils/coin'
import { address as contractAddress } from '../contracts/token.json'
import Model from '../server/schemas'

// 同步交易记录时每次交易数量的限制
const step = 30
// 提交信息的并行任务数量限制
const postParallelLimitation = 2
// mongoDb 的链接实例
const walletTransInfoModel = Model.walletTransInfo()

async function saveToDb(data) {
  let { address, eth, cre, trans } = data
  let exsistEntity = await walletTransInfoModel.findOne({ address })
  if (exsistEntity) {
    exsistEntity.eth = eth
    exsistEntity.cre = cre
    // 拼接并去重 transaction 集合
    exsistEntity.trans = [...new Set(exsistEntity.trans.concat(trans))]
    walletTransInfoModel
      .update({ address }, exsistEntity)
      .then(() => {
        console.log(`save wallet transactions succ : ${address}`)
      })
      .catch((err) => {
        console.log(err)
      })
  } else {
    walletTransInfoModel(data)
      .save()
      .then(() => {
        console.log(`save wallet transactions succ : ${address}`)
      })
      .catch((err) => {
        console.log(err)
      })
  }
}

/**
 * 扫描区块查询账户下的 transactions
 * @param {*} eth 钱包客户端链接
 * @param {*} accounts 钱包地址数组
 * @param {*} startBlockNumber 扫描起始区块高度
 * @param {*} endBlockNumber 扫描截止区块高度
 * @param {boolean} isContract 是否是合约地址
 */
function getTransactionsByAccounts(eth, accounts, startBlockNumber = 0, endBlockNumber, isContract) {
  return new Promise((resolve) => {
    console.log(`Searching for transactions within blocks ${startBlockNumber} and ${endBlockNumber}`)

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
      onFinished: () => {
        console.log('钱包地址信息扫描完毕...开始扫描区块')
        scanBlock()
        // 钱包信息创建完成时 执行区块扫描任务队列
        taskQueue.consume()
      },
    })

    let scanBlock = function () {
      // eslint-disable-next-line
      for (let i = startBlockNumber; i <= endBlockNumber; i++) {
        taskQueue.add(new TaskCapsule(() => new Promise(async (resolve, reject) => {
          if (i % 1000 === 0) {
            console.log(`Searching block ${i}`)
          }
          let block = await eth.getBlock(i, true).catch(reject)
          if (block != null && block.transactions != null) {
            // 遍历区块内的交易记录
            block
              .transactions
              .forEach(({ from: fromAddress, to, hash, value, input }) => {
                // 如果该交易的转入或转出地址与指定钱包有任何一则匹配
                // 则将该转账记录添加到对应钱包下的交易记录集合中
                accounts.forEach((accountAddr) => {
                  if (fromAddress === accountAddr || to === accountAddr) {
                    transactionSet[accountAddr].trans.push({ txid: hash, value, input })
                  }
                })
              })
          }
          resolve()
        })))
      }
    }

    accounts.map(_addr => accountsQueue.add(new TaskCapsule(() =>
      new Promise(async (resolve, reject) => {
        if (isContract) {
          let ethBalance = await eth.getBalance(_addr)
            .catch((ex) => {
              console.log(`get address eth balance failded: ${_addr}`)
              reject(ex)
            })
          transactionSet[_addr] = {
            address: _addr,
            eth: eth.extend.utils.fromWei(ethBalance, 'ether'),
            cre: 0,
            trans: [],
          }
          resolve()
        } else {
          let ethBalance = await eth.getBalance(_addr)
            .catch((ex) => {
              console.log(`get address eth balance failded: ${_addr}`)
              reject(ex)
            })
          let creBalance = await getTokenBalance(_addr)
            .catch((ex) => {
              console.log(`get address cre balance failded: ${_addr}`)
              reject(ex)
            })
          transactionSet[_addr] = {
            address: _addr,
            eth: eth.extend.utils.fromWei(ethBalance, 'ether'),
            cre: creBalance,
            trans: [],
          }
          resolve()
        }
      }))))

    accountsQueue.consume()
  })
}

/**
 * 同步 transaction 信息
 * @param {*} info 要同步的信息体
 */
function submitTransInfo(info, callback) {
  // 将扫描后的数据先存到本地
  saveToDb(info)

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

export default async (startBlockNumber = 0, endBlockNumber, type = 'account') => {
  let connect = await web3.onWs
  endBlockNumber = endBlockNumber || await connect.eth.getBlockNumber()
  let accounts
  switch (type) {
    case 'account':
    default:
      accounts = await connect.eth.getAccounts()
        .catch((err) => {
          console.error(`获取本地账户信息失败: ${err.message}`)
          process.exit(0)
        })
      break
    case 'contract':
      accounts = contractAddress
      break
  }

  let transCollection = await getTransactionsByAccounts(connect.eth, accounts, startBlockNumber, endBlockNumber, type === 'contract')

  console.log(`共计 ${transCollection.size} 个钱包账户:`)

  let submitQueue = new ParallelQueue({
    limit: postParallelLimitation,
    toleration: 1000,
  })

  transCollection
    .forEach((address) => {
      submitQueue.add(new TaskCapsule(() => new Promise((endResolve) => {
        // 获取钱包地址的详细信息
        let detail = transCollection[address]
        // 判断该地址下的交易记录的数量是否为空
        if (detail.trans.length > 0) {
          console.log(`扫描 ${address} 下 ${detail.trans.length} 条转账细节...`)
          // 交易记录详情
          let transactions = []
          // 交易详情查询异步任务队列
          let receiptQueue = new ParallelQueue({
            limit: 20,
            onFinished: () => {
              console.log(`扫描 ${address} 转账细节成功，即将发送...`)
              detail.trans = transactions
              submitTransInfo(detail, endResolve)
            },
          })

          detail
            .trans
            .forEach(({ txid, value, input }) => {
              // 创建查询交易记录详情的异步任务
              receiptQueue.add(new TaskCapsule(
                () => new Promise(async (resolve, reject) => {
                  let { from: fromAddress, to, cumulativeGasUsed, gasUsed, blockNumber } = await connect
                    .eth
                    .getTransactionReceipt(txid)
                    .catch((err) => {
                      reject(new Error(`获取转账明细失败: ${err.message}`))
                    })

                  // 将交易详情信息添加到队列中
                  transactions.push({
                    block: blockNumber,
                    txid,
                    from: fromAddress,
                    to,
                    cumulativeGasUsed,
                    gasUsed,
                    ethTransferred: connect.eth.extend.utils.fromWei(value, 'ether'),
                    tokenTransferred: decodeTransferInput(input)[2] || 0,
                  })
                  resolve()
                })
              ))
            })

          // 执行交易详情的任务队列
          receiptQueue.consume()
        } else {
          // 没有交易记录的账户
          // 直接提交账户余额等信息
          submitTransInfo(detail, endResolve)
        }
      })))
    })

  submitQueue.consume()
}
