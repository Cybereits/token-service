import {
  GraphQLInt as int,
  GraphQLString as str,
  GraphQLNonNull as NotNull,
} from 'graphql'

import { batchTransactinTaskModel } from '../../core/schemas'
import { getTxOperationsByTaskID } from '../scenes/batchTask'
import { batchTransactionTask, txOperationRecord } from '../types/plainTypes'
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
    result = await batchTransactinTaskModel.find().skip(pageIndex * pageSize).limit(pageSize).populate('details')

    return PaginationResult(result, pageIndex, pageSize, total)
  },
}

export const queryTxOperationRecords = {
  type: PaginationWrapper(txOperationRecord),
  description: '查询转账操作记录',
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
    let result = null
    let total = 0

    if (pageSize <= 0) {
      throw new TypeError('pageSize 必须为有效正整数')
    }

    result = await getTxOperationsByTaskID(taskID).skip(pageIndex * pageSize).limit(pageSize)
    if (result) {
      return PaginationResult(result.details, pageIndex, pageSize, total)
    } else {
      throw new Error('没有找到对应的任务')
    }
  },
}
