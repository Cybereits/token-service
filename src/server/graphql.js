import {
  GraphQLSchema as GSchema,
  GraphQLObjectType as Obj,
} from 'graphql'

import { createAccount, createMultiAccount, queryAccountList } from './fields/account'
import { queryAllBalance } from './fields/balance'
import { createPrizeInfo, queryPrizeList, handlePrizes } from './fields/prize'
import { commonStatusEnum, prizeTypeEnum } from './fields/enum'
import { queryContractAbi, deployTokenContract } from './fields/contract'
import { queryBatchTrasactionTasks, queryTxOperationRecords } from './fields/transactions'

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
    queryBatchTrasactionTasks,
    queryTxOperationRecords,
  },
})

const mutations = new Obj({
  name: 'Mutations',
  description: '修改接口',
  fields: {
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
