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

import { getStatus } from '../../core/enums'

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

export const balanceFilter = new GraphQLInputObjectType({
  name: 'balanceFilter',
  description: 'Balance 查询过滤条件',
  fields: {
    ethAddresses: { type: new List(str), description: '要查询的钱包地址' },
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
    txid: {
      type: str,
      description: '交易 id',
    },
  },
})

export const txOperationRecord = new Obj({
  name: 'txOperationRecord',
  description: '交易操作记录',
  fields: {
    from: {
      type: str,
      description: '出账地址',
    },
    to: {
      type: str,
      description: '入账地址',
    },
    amount: {
      type: int,
      description: '转账数量',
    },
    tokenType: {
      type: str,
      description: '代币类型',
    },
    comment: {
      type: str,
      description: '备注',
    },
  },
})

export const batchTransactionTask = new Obj({
  name: 'batchTransactionTask',
  description: '批量交易任务',
  fields: {
    id: {
      type: str,
      description: 'Identity',
      resolve: t => t._id,
    },
    amount: {
      type: int,
      description: '交易数量',
    },
    details: {
      type: new List(txOperationRecord),
      description: '任务包含的交易细节',
    },
    type: {
      type: str,
      description: '任务类型',
    },
    createAt: {
      type: str,
      description: '创建时间',
      resolve: t => t.createAt.toJSON(),
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
