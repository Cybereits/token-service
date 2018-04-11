import {
  GraphQLInt as int,
  GraphQLString as str,
  GraphQLNonNull as NotNull,
  GraphQLList as List,
} from 'graphql'
import { TaskCapsule, ParallelQueue } from 'async-task-manager'

import Model from '../../core/schemas'
import data0 from '../../../prize.json'
import data1 from '../../../prize1.json'
import { deployOwnerAddr, deployOwnerSecret } from '../../config/const'
import { sendToken } from '../../utils/token'

import { STATUS, PRIZE_TYPES } from '../../core/enums'
import { prizeInfo, inputPrizeInfo, filterPrizeInfo } from '../types/plainTypes'
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
    return Model.prizeInfo().create({
      ethAddress,
      prize,
      type: type || PRIZE_TYPES.default,
      status: STATUS.pending,
    })
  },
}

export const initPrizeInfo = {
  type: str,
  description: '从文件初始化奖励信息',
  async resolve() {
    await Model.prizeInfo().remove()
    await Model.prizeInfo().create(data0.map(({ eth_address, prize }) => ({ ethAddress: eth_address, prize })))
    await Model.prizeInfo().create(data1.map(({ eth_address, prize }) => ({ ethAddress: eth_address, prize })))
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

    if (filter) {
      total = await Model.prizeInfo().find(filter).count()
      result = await Model.prizeInfo().find(filter).skip(pageIndex * pageSize).limit(pageSize)
    } else {
      total = await Model.prizeInfo().find(filter).count()
      result = await Model.prizeInfo().find(filter).skip(pageIndex * pageSize).limit(pageSize)
    }

    return PaginationResult(result, pageIndex, pageSize, total)
  },
}

export const handlePrizes = {
  type: new List(str),
  description: '开始处理奖励',
  args: {
    amount: {
      type: new NotNull(int),
      description: '本次处理的任务数量',
      default: -1,
    },
    status: {
      type: int,
      description: '本次处理的任务类型: pending（0 待处理，默认）failure（-1 失败）',
    },
    address: {
      type: str,
      description: '出账的钱包地址，默认合约部署者的钱包地址',
    },
    secret: {
      type: str,
      description: '出账钱包地址的密钥，默认合约部署者的钱包密钥',
    },
  },
  async resolve(root, { amount, status = STATUS.pending, address = deployOwnerAddr, secret = deployOwnerSecret }) {
    // 获取所有待处理的
    let pendingTerms
    // 处理所有
    if (amount === -1) {
      pendingTerms = await Model.prizeInfo().find({ status })
    } else {
      pendingTerms = await Model.prizeInfo().find({ status }).limit(amount)
    }

    if (pendingTerms) {
      if (pendingTerms.length > 0) {

        // 创建发送任务队列
        let queue = new ParallelQueue({
          limit: 5,
          toleration: 0,
        })

        pendingTerms.forEach((term) => {
          queue.add(
            // 添加发送代币的胶囊任务
            new TaskCapsule(() => {
              let { ethAddress, prize } = term
              return sendToken(address, secret, ethAddress, prize)
                .then(({ transactionHash }) => {
                  // 交易产生后将这条记录的状态设置为 “发送中” 并且记录 txID
                  term.status = STATUS.sending
                  term.txid = transactionHash
                  return term.save()
                })
                .catch(async (ex) => {
                  // 交易过程中出现问题 则将该条记录的状态置为 ”失败“
                  term.status = STATUS.failure
                  term.txid = null
                  await term.save()
                  console.error(ex)
                  throw ex
                })
            })
          )
        })

        // 消费队列
        return queue
          .consume()
          .then(() => pendingTerms.map(t => t.ethAddress))
          .catch(() => new Error(`处理未正常结束: 实际已发送 ${queue.succ} 条，失败 ${queue.fail} 条`))
      } else {
        throw new Error('没有要发送的代币奖励')
      }
    } else {
      throw new Error('处理失败')
    }
  },
}
