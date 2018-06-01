import {
  GraphQLInt as int,
  GraphQLString as str,
  GraphQLNonNull as NotNull,
  GraphQLList as List,
} from 'graphql'
import { TaskCapsule, ParallelQueue } from '@cybereits/ccl/asyncQueue'

import { STATUS, TOKEN_TYPE } from '../../core/enums'
import { batchTransactinTaskModel, txRecordModel } from '../../core/schemas'
import { batchTransactionTask, TokenTypeEnum, txRecord, txFilter } from '../types/plainTypes'
import { PaginationResult, PaginationWrapper } from '../types/complexTypes'
import { sendETH, sendToken } from '../../core/scenes/token'

/**
 * 批量发送交易
 * @param {Array<string>} recordIds 交易记录 id 数组
 * @returns {Promise}
 */
async function sendBatchTxs(recordIds) {

  if (recordIds instanceof Array && recordIds.length > 0) {
    // 创建发送任务队列
    let queue = new ParallelQueue({
      limit: 10,
      toleration: 0,
    })

    let transactions = await txRecordModel.find({ _id: { $in: recordIds } })

    transactions.forEach((transaction) => {
      let { amount, from, to, status, tokenType } = transaction
      // 当交易的发送状态为成功、发送中时 中断本次发送
      if (status !== STATUS.success && status !== STATUS.sending) {
        // 判断要发送的代币类型
        if (tokenType === TOKEN_TYPE.cre) {
          // 发送 cre
          // 添加发送代币的胶囊任务
          queue.add(new TaskCapsule(
            () => sendToken(from, to, amount)
              .then((transactionHash) => {
                // 交易产生后将这条记录的状态设置为 “发送中” 并且记录 txID
                transaction.status = STATUS.sending
                transaction.txid = transactionHash
                return transaction.save()
              })
              .catch(async (ex) => {
                console.error(ex.message)
                // 交易过程中出现问题 则将该条记录的状态置为 ”失败“
                transaction.status = STATUS.failure
                transaction.exceptionMsg = ex.message
                transaction.txid = null
                return transaction.save()
              })
          ))
        } else if (tokenType === TOKEN_TYPE.eth) {
          // 发送 eth
          queue.add(new TaskCapsule(
            () => sendETH(from, to, amount)
              .then((transactionHash) => {
                // 交易产生后将这条记录的状态设置为 “发送中” 并且记录 txID
                transaction.status = STATUS.sending
                transaction.txid = transactionHash
                return transaction.save()
              })
              .catch(async (ex) => {
                console.error(ex.message)
                // 交易过程中出现问题 则将该条记录的状态置为 ”失败“
                transaction.status = STATUS.failure
                transaction.exceptionMsg = ex.message
                transaction.txid = null
                return transaction.save()
              })
          ))
        } else {
          // 不支持的代币类型
          console.warn(`不支持的代币类型 [${tokenType}]`)
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

export const queryBatchTrasactionTasks = {
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

    total = await batchTransactinTaskModel.find().count()
    result = await batchTransactinTaskModel
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

    let total = await txRecordModel.find({ taskid: taskID }).count()
    let result = await txRecordModel.find({ taskid: taskID }).skip(pageIndex * pageSize).limit(pageSize)

    if (result) {
      return PaginationResult(result.slice((pageIndex * pageSize), ((pageIndex + 1) * pageSize)), pageIndex, pageSize, total)
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
      type: new NotNull(int),
      description: '转账代币数量',
      defaultValue: 0,
    },
    tokenType: {
      type: TokenTypeEnum,
      description: '转账代币类型 默认cre',
      defaultValue: TOKEN_TYPE.cre,
    },
    comment: {
      type: str,
      description: '备注',
    },
  },
  async resolve(root, { outAccount, to, amount, tokenType, comment }) {
    return txRecordModel.create({
      amount,
      from: outAccount,
      to,
      tokenType,
      comment,
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
      description: '要发送的信息，以地址和代币数量以逗号分割，交易之间以换行分隔，例如: 0xa7d246bcaf81967d981e18a64a1e6d0ed2224c38,3000\n0xc3bf8c8e700cf237badfc46e63b922b5c7786624,4000',
    },
    comment: {
      type: new NotNull(str),
      description: '批量任务描述',
    },
    tokenType: {
      type: TokenTypeEnum,
      description: '转账代币类型 默认cre',
      defaultValue: TOKEN_TYPE.cre,
    },
    outAccount: {
      type: str,
      description: '出账的钱包账户地址',
    },
  },
  async resolve(root, { transactions, comment, tokenType, outAccount }) {
    if (!TOKEN_TYPE[tokenType]) {
      throw new Error('不支持的代币类型')
    }
    // 获取所有待处理的
    let txCollection = transactions
      .split('\n')
      .map(str => str.split(','))

    if (txCollection.length === 0) {
      throw new Error('批量转账任务的转账笔数必须大于1')
    }
    if (txCollection.findIndex(t => t.amount <= 0) > -1) {
      throw new Error('批量转账任务的所有转账金额必须大于0')
    }
    // 先创建批量任务的实体
    let task = await batchTransactinTaskModel.create({
      amount: txCollection.length,
      comment,
    })

    let taskID = task._id

    // 创建转账的交易实体
    await txRecordModel.insertMany(txCollection.map(
      ([address, amount]) => ({
        amount,
        from: outAccount,
        to: address,
        tokenType,
        taskid: taskID,
        status: STATUS.pending,
      }))
    )

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

    total = await txRecordModel.find(filter).count()
    result = await txRecordModel.find(filter).skip(pageIndex * pageSize).limit(pageSize)

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
  async resolve(root, { ids, taskid }) {
    if (ids && ids.length > 0) {
      sendBatchTxs(ids)
      return 'success'
    } else if (taskid) {
      let recordIds = await txRecordModel
        .find({ taskid }, '_id') // 只获取 id
        .catch((ex) => { throw ex })
      if (recordIds && recordIds.length > 0) {
        sendBatchTxs(recordIds)
        return 'success'
      }
    } else {
      throw new Error('必须指定发送交易或者是批量任务两者之一')
    }
  },
}
