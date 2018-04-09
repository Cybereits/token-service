import {
  GraphQLSchema as GSchema,
  GraphQLObjectType as Obj,
} from 'graphql'

import { createAccount, getAccountList } from './fields/account'
import { queryTokenBalance, queryEthBalance, queryAllBalance } from './fields/balance'
import { initPrizeInfo, createPrizeInfo, getPrizeList } from './fields/prize'
import { commonStatusEnum, prizeTypeEnum } from './fields/enum'

// 通用的修改功能
const queries = new Obj({
  name: 'Queries',
  description: '查询接口',
  fields: {
    createAccount,
    getAccountList,
    queryTokenBalance,
    queryEthBalance,
    queryAllBalance,
    getPrizeList,
    commonStatusEnum,
    prizeTypeEnum,
  },
})

const mutations = new Obj({
  name: 'Mutations',
  description: '修改接口',
  fields: {
    initPrizeInfo,
    createPrizeInfo,
  },
})

export default new GSchema({
  query: queries,
  mutation: mutations,
})
