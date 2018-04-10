import { TaskCapsule, ParallelQueue } from 'async-task-manager'

import { connect } from '../../framework/web3'
import { decodeTransferInput } from '../../utils/token'
import Model from '../../core/schemas'

/**
 * 保存交易详情
 * @param {object} tx 交易详情
 */
async function saveTrans(tx) {
  let transaction = Model.transactionInfo()
  await transaction.findOneAndRemove({ txid: tx.txid })
  return transaction(tx).save()
}

/**
 * 保存扫描日志
 * @param {number} blockNum 区块高度
 */
async function saveScanLog(blockNum) {
  let blockScanLogModel = Model.blockScanLog()
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
  return Model.blockScanLog()
    .find({}, { blockNum: 1 })
    .then(res => res.map(t => t.blockNum))
}

/**
 * 扫描区块查询账户下的 transactions
 * @param {array<string>} accounts 钱包地址数组
 * @param {number} startBlockNumber 扫描起始区块高度
 * @param {number} endBlockNumber 扫描截止区块高度
 * @param {boolean} force 强制重新扫描，通常是有新的地址添加进来之后要重新扫描区块
 */
async function getTransactions(startBlockNumber = 0, endBlockNumber, force = false) {
  // 扫描区块的任务队列
  // 由于获取区块时并发数量过高会导致 missing trie node 错误
  // 所以限制区块扫描任务并发数量不得超过 10
  let taskQueue = new ParallelQueue({ limit: 10 })
  let scannedBlocks = await getScannedBlockNumbers()
  for (let i = startBlockNumber; i <= endBlockNumber; i += 1) {
    if (force || !~scannedBlocks.indexOf(i)) {
      taskQueue.add(new TaskCapsule(() => new Promise(async (resolve, reject) => {
        if (i % 50 === 0) {
          console.log(`Searching block ${i}`)
        }
        let block = await connect.eth.getBlock(i, true)
        if (block != null && block.transactions != null) {
          // 遍历区块内的交易记录
          let transQueue = new ParallelQueue({ limit: 10 })

          block.transactions.forEach(({ from: fromAddress, to, hash, value, input }) => {
            // 将该转账记录添加到交易记录集合中
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

              // 将交易详情信息记录到数据库
              await saveTrans(
                {
                  block: blockNumber,
                  txid: hash,
                  from: fromAddress,
                  to,
                  cumulativeGasUsed,
                  gasUsed,
                  ethTransferred: connect.eth.extend.utils.fromWei(value, 'ether'),
                  tokenTransferred: decodeTransferInput(input)[2] || 0,
                }
              )
                .then(resolve)
                .catch(reject)
            })))
          })

          transQueue
            .consume()
            // 保存区块扫描记录
            .then(() => saveScanLog(i))
            .then(resolve)
            .catch(reject)
        } else {
          resolve()
        }
      })))
    }
  }
  return taskQueue
}

// 扫描代币合约下的所有转账交易信息
export default async function (job, done) {
  console.log('开始扫描区块，同步交易信息')
  // 截止到当前区块高度
  let endBlockNumber = await connect.eth.getBlockNumber()
  let taskQueue = await getTransactions(0, endBlockNumber, false)
  await taskQueue
    .consume()
    .then(() => {
      console.log(`区块扫描完成，所有账户的交易记录匹配完毕!当前高度${endBlockNumber}`)
      done()
    })
    .catch((ex) => {
      console.error(`区块扫描失败: ${ex}`)
      done()
    })
}
