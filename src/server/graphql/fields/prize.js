import {
  GraphQLInt as int,
  GraphQLList as List,
} from 'graphql'

import Model from '../../../core/schemas'

import { prizeInfo, inputPrizeInfo, STATUS, PRIZE_TYPES } from '../types/plainTypes'

export const createPrizeInfo = {
  type: prizeInfo,
  description: '创建奖励信息',
  args: {
    term: {
      type: inputPrizeInfo,
    },
  },
  async resolve(root, { term: { ethAddress, prize = 0 } }) {
    return Model.prizeInfo().create({
      ethAddress,
      prize,
      type: PRIZE_TYPES.default,
      status: STATUS.pending,
    })
  },
}

export const getPrizeList = {
  type: new List(prizeInfo),
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
  },
  async resolve(root, { pageIndex = 0, pageSize = 10 }) {
    return Model.prizeInfo().find().skip(pageIndex * pageSize).limit(pageSize)
  },
}
