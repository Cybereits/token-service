import {
  GraphQLInt as int,
  GraphQLString as str,
  GraphQLNonNull as NotNull,
} from 'graphql'

import { deployOwnerAddr, deployOwnerSecret } from '../../config/const'

import { STATUS, TOKEN_TYPE } from '../../core/enums'
import { batchTransactinTaskModel, txRecordModel } from '../../core/schemas'
import { batchTransactionTask, txRecord, txFilter } from '../types/plainTypes'
import { PaginationResult, PaginationWrapper } from '../types/complexTypes'

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
    to: { type: new NotNull(str), description: '入账钱包地址' },
    amount: { type: new NotNull(int), description: '转账代币数量', defaultValue: 0 },
    tokenType: { type: new NotNull(str), description: '转账代币类型 默认cre，可以指定 eth、gxs、eos' },
    comment: { type: str, description: '备注' },
  },
  async resolve(root, { to, amount, tokenType, comment }) {
    return txRecordModel.create({
      to,
      amount,
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
      type: str,
      description: '转账代币类型 默认cre，可以指定 eth、gxs、eos',
      defaultValue: 'cre',
    },
    outAccount: {
      type: str,
      description: '出账的钱包地址，默认合约部署者的钱包地址',
    },
    secret: {
      type: str,
      description: '出账钱包地址的密钥，默认合约部署者的钱包密钥',
    },
  },
  async resolve(root, { transactions, comment, tokenType, outAccount = deployOwnerAddr, secret = deployOwnerSecret }) {
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
