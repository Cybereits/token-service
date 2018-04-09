import {
  GraphQLSchema as GSchema,
  GraphQLObjectType as Obj,
} from 'graphql'

import { createAccount, getAccountList } from './fields/accounts'
import { queryTokenBalance, queryEthBalance } from './fields/balance'
import { createPrizeInfo, getPrizeList } from './fields/prize'

// 通用的修改功能
const queries = new Obj({
  name: 'Queries',
  description: '查询接口',
  fields: {
    createAccount,
    getAccountList,
    queryTokenBalance,
    queryEthBalance,
    getPrizeList,
  },
})

const mutations = new Obj({
  name: 'Mutations',
  description: '修改接口',
  fields: {
    createPrizeInfo,
  },
})

export default new GSchema({
  query: queries,
  mutation: mutations,
})
