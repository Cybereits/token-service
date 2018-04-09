import {
  GraphQLObjectType as Obj,
  GraphQLString as str,
  // GraphQLList as List,
  GraphQLInt as int,
  GraphQLInputObjectType,
  GraphQLNonNull as notNull,
  // GraphQLFloat as float,
  // GraphQLBoolean as bool,
} from 'graphql'

// 通用状态
export const STATUS = {
  pending: 0, // 待处理
  sending: 1, // 处理中
  success: 2, // 成功
  failure: -1,  // 失败
}

// 奖励类型
export const PRIZE_TYPES = {
  default: 'cre_token', // 默认奖励类型 - CRE 代币
}

const statusKeys = Object.keys(STATUS)

function getStatus(_value) {
  return statusKeys.filter(t => STATUS[t] === _value)[0]
}

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
  fields: {
    ethAddress: { type: notNull(str), description: '钱包地址' },
    prize: { type: notNull(int), description: '奖励代币数量' },
  },
})
