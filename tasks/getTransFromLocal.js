import web3 from '../framework/web3'
import { TaskCapsule, ParallelQueue } from '../utils/task'
import { postTransactions } from '../apis/phpApis'
import { getTokenBalance } from '../utils/coin'
import { address as contractAddress } from '../contracts/token.json'

/**
 * 扫描区块查询账户下的 transactions
 * @param {*} eth 钱包客户端链接
 * @param {*} accounts 钱包地址数组
 * @param {*} startBlockNumber 扫描起始区块高度
 * @param {*} endBlockNumber 扫描截止区块高度
 * @param {*} onFinished 完成后的处理函数
 * @param {boolean} isContract 是否是合约地址
 */
async function getTransactionsByAccounts(eth, accounts, startBlockNumber = 0, endBlockNumber, onFinished, isContract) {
  console.log(`Searching for transactions within blocks ${startBlockNumber} and ${endBlockNumber}`)
  // console.log(`accounts: ${accounts.join(' | ')}`)

  let transactionSet = new Set(accounts)

  let taskQueue = new ParallelQueue({
    limit: 50,
    onFinished: () => {
      console.log('finished!')
      onFinished && onFinished(transactionSet)
    },
  })

  let proms = accounts.map(_addr => new Promise(async (resolve, reject) => {
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
  }))

  await Promise
    .all(proms)
    .catch((err) => {
      console.error(`初始化钱包集合对象失败,扫描终止:${err.message}`)
      process.exit(-1)
    })

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
                // here used to have a stupid mistake for using fromAddress
                transactionSet[accountAddr].trans.push({ txid: hash, value, input })
              }
            })
          })
      }
      resolve()
    })))
  }

  return taskQueue
}

/**
 * 提交 transaction 信息
 * @param {*} info 要提交的信息体
 */
function submitTransInfo(info) {
  // console.log(info)
  postTransactions(info)
    .then((res) => {
      if (+res.code === 0) {
        console.log(`同步成功，地址: ${info.address}， ${info.trans.length} 笔交易信息`)
      } else {
        throw new Error(res.msg)
      }
    })
    .catch((err) => {
      console.error(`同步钱包交易信息失败: ${err.message}`)
    })
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
          console.error(`获取本地账户信息失败：${err.message}`)
          process.exit(0)
        })
      break
    case 'contract':
      accounts = contractAddress
      break
  }

  let queue = await getTransactionsByAccounts(connect.eth, accounts, startBlockNumber, endBlockNumber, (transCollection) => {
    console.log(`共计 ${transCollection.size} 个钱包账户:`)
    transCollection
      .forEach((address) => {
        let detail = transCollection[address]
        if (detail.trans.length > 0) {
          let transactions = []
          let receiptQueue = new ParallelQueue({
            limit: 20,
            onFinished: () => {
              detail.trans = transactions
              submitTransInfo(detail)
            },
          })

          detail
            .trans
            .forEach(({ txid, value, input }) => {
              receiptQueue.add(new TaskCapsule(
                () => new Promise(async (resolve, reject) => {

                  let { from: fromAddress, to, cumulativeGasUsed, gasUsed, blockNumber } = await connect
                    .eth
                    .getTransactionReceipt(txid)
                    .catch((err) => {
                      reject(new Error(`获取转账明细失败: ${err.message}`))
                    })

                  transactions.push({
                    block: blockNumber,
                    txid,
                    from: fromAddress,
                    to,
                    cumulativeGasUsed,
                    gasUsed,
                    value,
                    input,
                  })

                  resolve()
                })
              ))
            })

          receiptQueue.consume()
        } else {
          submitTransInfo(detail)
        }
      })
  }, type === 'contract')

  queue.consume()
}
