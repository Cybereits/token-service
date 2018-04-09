import {
  GraphQLObjectType as Obj,
  GraphQLString as str,
  GraphQLList as List,
  GraphQLInt as int,
  GraphQLInputObjectType,
  GraphQLNonNull as notNull,
  // GraphQLFloat as float,
  // GraphQLBoolean as bool,
} from 'graphql'

import { STATUS } from '../../../core/enums'

const statusKeys = Object.keys(STATUS)

function getStatus(_value) {
  return statusKeys.filter(t => STATUS[t] === _value)[0]
}

export const hashResult = new Obj({
  name: 'hashResult',
  description: '键值对结果',
  fields: {
    name: { type: str, description: '名称' },
    value: { type: str, description: '值' },
  },
})

export const balanceDetail = new Obj({
  name: 'balanceDetail',
  description: '账户详情',
  fields: {
    ethAddress: {
      type: str,
      description: '钱包地址',
    },
    balances: {
      type: new List(hashResult),
      description: '账户信息详情',
    },
  },
})

export const prizeInfo = new Obj({
  name: 'PrizeInfo',
  description: '社区活动奖励（空投、糖果等）信息',
  fields: {
    ethAddress: {
      type: str,
      description: '钱包地址',
    },
    prize: {
      type: int,
      description: '奖励代币数量',
    },
    status: {
      type: str,
      description: '发放状态',
      resolve: t => getStatus(t.status),
    },
    type: {
      type: str,
      description: '奖励类型',
    },
  },
})

export const inputPrizeInfo = new GraphQLInputObjectType({
  name: 'inputPrizeInfo',
  description: '创建 PrizeInfo 的所需字段',
  fields: {
    ethAddress: { type: notNull(str), description: '钱包地址' },
    prize: { type: notNull(int), description: '奖励代币数量' },
  },
})

export const filterPrizeInfo = new GraphQLInputObjectType({
  name: 'prizeInfoFilter',
  description: 'PrizeInfo 查询过滤条件',
  fields: {
    ethAddress: { type: str, description: '钱包地址' },
    prize: { type: int, description: '奖励代币数量' },
    status: { type: int, description: '发放状态' },
    type: { type: str, description: '奖励类型' },
  },
})
