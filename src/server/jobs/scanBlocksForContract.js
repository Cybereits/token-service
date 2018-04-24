import { TaskCapsule, ParallelQueue, SerialQueue } from 'async-task-manager'

import { connect } from '../../framework/web3'
import { getTokenBalance, decodeTransferInput } from '../../utils/token'
import { address as contractAddress } from '../../contracts/token.json'
import { walletTransInfoModel, blockScanLogModel, blockScanLogForContractModel } from '../../core/schemas'

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
  let block = await blockScanLogModel.findOne({ blockNum })
  if (block) {
    return true
  } else {
    return blockScanLogModel.create({ blockNum })
  }
}

/**
 * 获取本地最后一次完成扫描的区块高度
 * 因为完成的高度不一定是连续的
 * 譬如：1,2,4
 * 这时候最后一个完成的区块高度应该是 2
 */
async function getScannedBlockNumbers() {
  return blockScanLogForContractModel
    .find({}, { blockNum: 1 })
    .then(res => res.map(t => t.blockNum))
    .catch((err) => {
      console.error(`Scan log error:${err}`)
    })
}

/**
 * 扫描区块获得每个地址下的 transacation 的 hash 列表
 * @param {array<string>} accounts 钱包地址数组
 * @param {number} startBlockNumber 扫描起始区块高度
 * @param {number} endBlockNumber 扫描截止区块高度
 * @param {Set} transactionSet 交易集合
 * @param {boolean} force 是否强制重新扫描
 */
async function scanBlock(accounts, transactionSet, startBlockNumber, endBlockNumber, force) {
  // 扫描区块的任务队列
  // 由于获取区块时并发数量过高会导致 missing trie node 错误
  // 所以限制区块扫描任务并发数量不得超过 10
  let taskQueue = new ParallelQueue({ limit: 10 })
  let scannedBlocks = await getScannedBlockNumbers()
  // eslint-disable-next-line
  for (let i = startBlockNumber; i <= endBlockNumber; i++) {
    if (force || !~scannedBlocks.indexOf(i)) {
      taskQueue.add(new TaskCapsule(() => new Promise(async (resolve, reject) => {
        if (i % 50 === 0) {
          console.log(`Searching block ${i}`)
        }
        let block = await connect.eth.getBlock(i, true).catch(reject)
        if (block != null && block.transactions != null) {
          let updateAddr = []
          // 遍历区块内的交易记录
          let transQueue = new ParallelQueue({ limit: 10 })

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

          transQueue
            .consume()
            .then(() => {
              let queue = new SerialQueue({ toleration: 0 })
              updateAddr.forEach((addr) => {
                // 将扫描的交易信息保存到数据库
                queue.add(new TaskCapsule(() => saveTrans(transactionSet[addr]).catch(reject)))
              })
              // 区块内的交易信息已成功同步 区块标记为已扫描
              queue.consume().then(() => saveScanLog(i).then(resolve))
            })
            .catch(reject)
        } else {
          resolve()
        }
      })))
    }
  }
  return taskQueue
}

/**
 * 扫描区块查询账户下的 transactions
 * @param {array<string>} accounts 钱包地址数组
 * @param {number} startBlockNumber 扫描起始区块高度
 * @param {number} endBlockNumber 扫描截止区块高度
 * @param {boolean} isContract 是否是合约地址
 * @param {boolean} force 强制重新扫描，通常是有新的地址添加进来之后要重新扫描区块
 */
function getTransactionsByAccounts(accounts, startBlockNumber = 0, endBlockNumber, isContract, force = false) {
  return new Promise(async (resolve, reject) => {

    let transactionSet = new Set(accounts)

    // 钱包信息任务队列
    // 由于获取钱包账户信息时并发数量过高会导致 missing trie node 错误
    // 所以限制任务并发数量不得超过 30
    let accountsQueue = new ParallelQueue({ limit: 30 })

    accounts.map(_addr => accountsQueue.add(new TaskCapsule(() =>
      new Promise(async (resolve, reject) => {

        let ethBalance = await connect.eth.getBalance(_addr)
          .catch((ex) => {
            console.log(`get address eth balance failded: ${_addr}`)
            reject(ex)
          })

        let creBalance = 0

        if (!isContract) {
          creBalance = await getTokenBalance(_addr).catch((ex) => {
            console.log(`get address cre balance failded: ${_addr}`)
            reject(ex)
          })
        }

        // 从本地存储中读取已经生成过的 walletTransInfo
        let existEntity = await walletTransInfoModel.findOne({ address: _addr })

        transactionSet[_addr] = {
          address: _addr,
          eth: connect.eth.extend.utils.fromWei(ethBalance, 'ether'),
          cre: creBalance,
          trans: (existEntity && existEntity.trans) || [],
        }

        resolve()
      }))))

    await accountsQueue.consume().catch(reject)
    console.log('钱包地址信息扫描完毕...开始扫描区块')
    let taskQueue = await scanBlock(accounts, transactionSet, startBlockNumber, endBlockNumber, force).catch(reject)
    // 钱包信息创建完成时 执行区块扫描任务队列
    await taskQueue.consume().catch(reject)
    console.log('区块扫描完成，所有账户的交易记录匹配完毕!')
    // 区块扫描完成后
    resolve()
  })
}

// 扫描代币合约下的所有转账交易信息
export default async function (job, done) {
  console.info('开始扫描区块，同步交易信息')

  // 当前只是扫描了合约地址
  // 可以支持扫描多个地址下的交易
  let accounts = contractAddress

  // switch (type) {
  //   case 'contract':
  //     accounts = contractAddress
  //     break
  //   case 'account':
  //   default:
  //     accounts = await connect.eth.getAccounts()
  //       .catch((err) => {
  //         console.error(`获取本地账户信息失败: ${err.message}`)
  //         process.exit(0)
  //       })
  //     break
  // }

  let startBlockNumber = 0
  // 截止到当前区块高度
  let endBlockNumber = await connect.eth.getBlockNumber()
  await getTransactionsByAccounts(accounts, startBlockNumber, endBlockNumber, true, false)
    .then(() => {
      console.log(`区块扫描完成，当前高度${endBlockNumber}`)
      done()
    })
    .catch((ex) => {
      console.error(`区块扫描失败: ${ex}`)
      done()
    })
}
