import {
  GraphQLInt as int,
  GraphQLString as str,
  GraphQLNonNull as NotNull,
  GraphQLList as List,
  GraphQLFloat as float,
} from 'graphql'
import { TaskCapsule, ParallelQueue } from 'async-task-manager'

import { STATUS, TOKEN_TYPES } from '../../core/enums'
import { BatchTransactinTaskModel, TxRecordModel } from '../../core/schemas'
import { batchTransactionTask, txRecord, txFilter } from '../types/plainTypes'
import { PaginationResult, PaginationWrapper } from '../types/complexTypes'
import { sendETH, sendToken } from '../../core/scenes/token'

/**
 * 批量发送交易
 * @param {Array<string>} recordIds 交易记录 id 数组
 * @param {string} username 操作用户
 * @returns {Promise}
 */
async function sendBatchTxs(recordIds, username) {
  if (recordIds instanceof Array && recordIds.length > 0) {
    // 创建发送任务队列
    let queue = new ParallelQueue({
      limit: 10,
      toleration: 0,
    })

    let transactions = await TxRecordModel.find({ _id: { $in: recordIds } })

    transactions.forEach((transaction) => {
      let {
        amount,
        from,
        to,
        status,
        tokenType,
        gasPrice,
        gasFee,
      } = transaction

      // 当交易的发送状态为成功、发送中时 中断本次发送
      if (status !== STATUS.success && status !== STATUS.sending) {
        if (tokenType === TOKEN_TYPES.eth) {
          // 发送 eth
          queue.add(new TaskCapsule(
            () => sendETH(from, to, amount, { gasPrice, gas: gasFee })
              .then((transactionHash) => {
                // 交易产生后将这条记录的状态设置为 “发送中” 并且记录 txID
                transaction.status = STATUS.sending
                transaction.txid = transactionHash
                transaction.sendTime = new Date()
                transaction.executer = username
                return transaction.save()
              })
              .catch(async (ex) => {
                console.error(`发送 ETH 失败：${ex.message}`)
                // 交易过程中出现问题 则将该条记录的状态置为 ”失败“
                transaction.status = STATUS.failure
                transaction.exceptionMsg = ex.message
                transaction.txid = null
                return transaction.save()
              })
          ))
        } else {
          // 添加发送代币的胶囊任务
          queue.add(new TaskCapsule(
            () => sendToken(from, to, amount, { tokenType, gasPrice, gas: gasFee })
              .then((transactionHash) => {
                // 交易产生后将这条记录的状态设置为 “发送中” 并且记录 txID
                transaction.status = STATUS.sending
                transaction.txid = transactionHash
                transaction.sendTime = new Date()
                transaction.executer = username
                return transaction.save()
              })
              .catch(async (ex) => {
                console.error(`发送代币失败：${ex.message}`)
                // 交易过程中出现问题 则将该条记录的状态置为 ”失败“
                transaction.status = STATUS.failure
                transaction.exceptionMsg = ex.message
                transaction.txid = null
                return transaction.save()
              })
          ))
        }
      } else {
        // 忽略发送中或者已经发送成功的交易
      }
    })

    // 消费队列
    return queue.consume()
  } else {
    throw new Error('没有需要发送的交易')
  }
}

export const queryBatchTransactionTasks = {
  type: PaginationWrapper(batchTransactionTask),
  description: '查询交易任务',
  args: {
    pageIndex: {
      type: int,
      description: '页码',
    },
    pageSize: {
      type: int,
      description: '页容',
    },
  },
  async resolve(root, { pageIndex = 0, pageSize = 10 }) {
    let result = null
    let total = 0

    if (pageSize <= 0) {
      throw new TypeError('pageSize 必须为有效正整数')
    }

    total = await BatchTransactinTaskModel.find().count()
    result = await BatchTransactinTaskModel
      .find()
      .sort({ createAt: -1 })
      .skip(pageIndex * pageSize)
      .limit(pageSize)

    return PaginationResult(result, pageIndex, pageSize, total)
  },
}

export const queryTxRecordsViaTaskId = {
  type: PaginationWrapper(txRecord),
  description: '通过任务 ID 查询转账记录',
  args: {
    pageIndex: {
      type: int,
      description: '页码',
    },
    pageSize: {
      type: int,
      description: '页容',
    },
    taskID: {
      type: NotNull(str),
      description: '批量任务的ID',
    },
  },
  async resolve(root, { pageIndex = 0, pageSize = 10, taskID }) {
    if (pageSize <= 0) {
      throw new TypeError('pageSize 必须为有效正整数')
    }

    let total = await TxRecordModel.find({ taskid: taskID }).count()
    let result = await TxRecordModel.find({ taskid: taskID }).skip(pageIndex * pageSize).limit(pageSize)

    if (result) {
      return PaginationResult(result, pageIndex, pageSize, total)
    } else {
      throw new Error('没有找到对应的转账记录')
    }
  },
}

export const createTransaction = {
  type: txRecord,
  description: '创建转账信息',
  args: {
    outAccount: {
      type: new NotNull(str),
      description: '转出的系统钱包地址',
    },
    to: {
      type: new NotNull(str),
      description: '入账钱包地址',
    },
    amount: {
      type: new NotNull(float),
      description: '转账代币数额',
      defaultValue: 0,
    },
    tokenType: {
      type: str,
      description: '转账代币类型 默认cre',
      defaultValue: TOKEN_TYPES.cre,
    },
    comment: {
      type: str,
      description: '备注',
    },
  },
  async resolve(root, { outAccount, to, amount, tokenType, comment }, { session }) {
    return TxRecordModel.create({
      amount,
      from: outAccount,
      to,
      tokenType,
      comment,
      creator: session.admin.username,
      status: STATUS.pending,
    })
  },
}

export const createBatchTransactions = {
  type: batchTransactionTask,
  description: '创建批量转账任务',
  args: {
    transactions: {
      type: new NotNull(str),
      description: '要发送的信息，以地址和代币数额以逗号分割，交易之间以换行分隔，最终的字符串需要 encodeURIComponent',
    },
    comment: {
      type: new NotNull(str),
      description: '批量任务描述',
    },
    tokenType: {
      type: str,
      description: '转账代币类型 默认cre',
      defaultValue: TOKEN_TYPES.cre,
    },
    outAccount: {
      type: str,
      description: '出账的钱包账户地址',
    },
  },
  async resolve(root, { transactions, comment, tokenType, outAccount }, { session }) {
    // 获取所有待处理的
    let txCollection = decodeURIComponent(transactions).split('\n')

    let txPairs = []

    txCollection.forEach((str) => {
      let infoArr = str.split(',')
      if (infoArr.length === 2) {
        txPairs.push({ address: infoArr[0], amount: +infoArr[1] })
      }
    })

    if (txPairs.length === 0) {
      return new Error('批量转账任务的转账笔数必须大于 1')
    }

    if (txPairs.findIndex(t => isNaN(t.amount)) > -1) {
      return new Error('批量转账任务金额无效，必须是大于 0 的数值')
    }

    if (txCollection.findIndex(t => t.amount <= 0) > -1) {
      return new Error('批量转账任务的所有转账金额必须大于 0')
    }

    // 先创建批量任务的实体
    let task = await BatchTransactinTaskModel.create({
      count: txPairs.length,
      comment,
    })

    let taskID = task._id

    // 创建转账的交易实体
    await TxRecordModel.insertMany(txPairs.map(({ address, amount }) => ({
      amount,
      from: outAccount.trim(),
      to: address.trim(),
      tokenType,
      taskid: taskID,
      status: STATUS.pending,
      creator: session.admin.username,
    })))

    return task
  },
}

export const queryTx = {
  type: PaginationWrapper(txRecord),
  description: '查询交易信息',
  args: {
    pageIndex: {
      type: int,
      description: '页码',
    },
    pageSize: {
      type: int,
      description: '页容',
    },
    filter: {
      type: txFilter,
      description: '过滤条件',
    },
  },
  async resolve(root, { pageIndex = 0, pageSize = 10, filter }) {
    let result = null
    let total = 0

    if (pageSize <= 0) {
      throw new TypeError('pageSize 必须为有效正整数')
    }

    total = await TxRecordModel.find(filter).count()
    result = await TxRecordModel.find(filter).sort({ createAt: -1 }).skip(pageIndex * pageSize).limit(pageSize)

    return PaginationResult(result, pageIndex, pageSize, total)
  },
}

export const sendTransaction = {
  type: str,
  description: '发送交易',
  args: {
    ids: {
      type: new List(str),
      description: '指定交易的 id 数组',
    },
    taskid: {
      type: str,
      description: '指定批量任务的 id',
    },
  },
  async resolve(root, { ids, taskid }, { session }) {
    let { admin } = session
    if (!admin || admin.role !== 1) {
      return new Error('您没有发送交易的权限')
    }
    if (ids && ids.length > 0) {
      sendBatchTxs(ids, admin.username)
      return 'success'
    } else if (taskid) {
      let recordIds = await TxRecordModel
        .find({ taskid }, '_id') // 只获取 id
        .catch((ex) => { throw ex })
      if (recordIds && recordIds.length > 0) {
        sendBatchTxs(recordIds, admin.username)
        return 'success'
      }
    } else {
      throw new Error('必须指定发送交易或者是批量任务两者之一')
    }
  },
}
