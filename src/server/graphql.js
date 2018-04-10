import {
  GraphQLSchema as GSchema,
  GraphQLObjectType as Obj,
} from 'graphql'

import { createAccount, createMultiAccount, queryAccountList } from './fields/account'
import { queryAllBalance } from './fields/balance'
import { initPrizeInfo, createPrizeInfo, queryPrizeList, handlePrizes } from './fields/prize'
import { commonStatusEnum, prizeTypeEnum } from './fields/enum'
import { queryContractAbi, deployTokenContract } from './fields/contract'

// 通用的修改功能
const queries = new Obj({
  name: 'Queries',
  description: '查询接口',
  fields: {
    queryAccountList,
    queryAllBalance,
    queryContractAbi,
    queryPrizeList,
    commonStatusEnum,
    prizeTypeEnum,
  },
})

const mutations = new Obj({
  name: 'Mutations',
  description: '修改接口',
  fields: {
    initPrizeInfo,
    handlePrizes,
    createAccount,
    createMultiAccount,
    createPrizeInfo,
    deployTokenContract,
  },
})

export default new GSchema({
  query: queries,
  mutation: mutations,
})
