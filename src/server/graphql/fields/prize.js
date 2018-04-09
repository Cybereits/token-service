import {
  GraphQLInt as int,
  GraphQLString as str,
} from 'graphql'

import Model from '../../../core/schemas'
import data0 from '../../../../prize.json'
import data1 from '../../../../prize1.json'

import { STATUS, PRIZE_TYPES } from '../../../core/enums'
import { prizeInfo, inputPrizeInfo, filterPrizeInfo } from '../types/plainTypes'
import { PaginationWrapper } from '../types/complexTypes'

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

export const getPrizeList = {
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

    return {
      total,
      pageIndex,
      pageSize,
      pageCount: Math.ceil(total / pageSize),
      items: result,
    }
  },
}
