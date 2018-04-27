import {
  GraphQLInt as int,
  GraphQLString as str,
} from 'graphql'
import { TaskCapsule, ParallelQueue } from 'async-task-manager'

import { prizeInfoModel } from '../../core/schemas'
import { saveBatchTransactionTask } from '../scenes/batchTask'

import { deployOwnerAddr, deployOwnerSecret } from '../../config/const'
import { sendToken } from '../../utils/token'

import { TOKEN_TYPE, STATUS, PRIZE_TYPES } from '../../core/enums'
import { prizeInfo, inputPrizeInfo, filterPrizeInfo, handlePrizesParams, batchTransactionTask } from '../types/plainTypes'
import { PaginationWrapper, PaginationResult } from '../types/complexTypes'

export const createPrizeInfo = {
  type: prizeInfo,
  description: '创建奖励信息',
  args: {
    term: {
      type: inputPrizeInfo,
    },
  },
  async resolve(root, { term: { ethAddress, prize = 0, type } }) {
    return prizeInfoModel.create({
      ethAddress,
      prize,
      type: type || PRIZE_TYPES.default,
      status: STATUS.pending,
    })
  },
}

export const batchCreate = {
  type: str,
  description: '批量创建',
  async resolve() {
    // await prizeInfoModel.remove()
    // await prizeInfoModel.create(data0.map(({ eth_address, prize }) => ({ ethAddress: eth_address, prize })))
    // await prizeInfoModel.create(data1.map(({ eth_address, prize }) => ({ ethAddress: eth_address, prize })))
    return 'success'
  },
}

export const queryPrizeList = {
  type: PaginationWrapper(prizeInfo),
  description: '查询奖励信息',
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
      type: filterPrizeInfo,
      description: '过滤条件',
    },
  },
  async resolve(root, { pageIndex = 0, pageSize = 10, filter }) {
    let result = null
    let total = 0

    if (pageSize <= 0) {
      throw new TypeError('pageSize 必须为有效正整数')
    }

    total = await prizeInfoModel.find(filter).count()
    result = await prizeInfoModel.find(filter).skip(pageIndex * pageSize).limit(pageSize)

    return PaginationResult(result, pageIndex, pageSize, total)
  },
}

export const handlePrizes = {
  type: batchTransactionTask,
  description: '开始处理奖励',
  args: {
    param: {
      type: handlePrizesParams,
      description: '处理奖励参数',
    },
  },
  async resolve(root, { param }) {
    let { amount, status = STATUS.pending, address = deployOwnerAddr, secret = deployOwnerSecret } = param
    // 获取所有待处理的
    let pendingTerms
    // 处理所有
    if (amount === -1) {
      pendingTerms = await prizeInfoModel.find({ status })
    } else {
      pendingTerms = await prizeInfoModel.find({ status }).limit(amount)
    }

    if (pendingTerms) {
      if (pendingTerms.length > 0) {

        // 创建发送任务队列
        let queue = new ParallelQueue({
          limit: 10,
          toleration: 0,
        })

        pendingTerms.forEach((term) => {
          queue.add(
            // 添加发送代币的胶囊任务
            new TaskCapsule(() => {
              let { ethAddress, prize } = term
              return sendToken(address, secret, ethAddress, prize)
                .then((transactionHash) => {
                  // 交易产生后将这条记录的状态设置为 “发送中” 并且记录 txID
                  term.status = STATUS.sending
                  term.txid = transactionHash
                  return term.save()
                })
                .catch(async (ex) => {
                  console.error(ex.message)
                  // 交易过程中出现问题 则将该条记录的状态置为 ”失败“
                  term.status = STATUS.failure
                  term.txid = null
                  await term.save()
                })
            })
          )
        })

        // 消费队列
        queue.consume()

        return saveBatchTransactionTask(
          pendingTerms.map(({ ethAddress, prize }) => ({
            from: address,
            to: ethAddress,
            amount: prize,
            tokenType: TOKEN_TYPE.cre,
          })),
          '社区邀请活动奖励',
        )
      } else {
        throw new Error('没有要发送的代币奖励')
      }
    } else {
      throw new Error('处理失败')
    }
  },
}
