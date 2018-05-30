import {
  GraphQLSchema as GSchema,
  GraphQLObjectType as Obj,
} from 'graphql'

import { createAccount, createMultiAccount, queryAccountList } from './fields/account'
import { queryAllBalance } from './fields/balance'
import { commonStatusEnum } from './fields/enum'
import { queryContractAbi, deployCREContract } from './fields/contract'
import {
  queryBatchTrasactionTasks,
  queryTxRecordsViaTaskId,
  queryTx,
  createTransaction,
  createBatchTransactions,
} from './fields/transactions'

// 通用的修改功能
const queries = new Obj({
  name: 'Queries',
  description: '查询接口',
  fields: {
    commonStatusEnum,
    queryAccountList,
    queryAllBalance,
    queryContractAbi,
    queryBatchTrasactionTasks,
    queryTx,
    queryTxRecordsViaTaskId,
  },
})

const mutations = new Obj({
  name: 'Mutations',
  description: '修改接口',
  fields: {
    createAccount,
    createBatchTransactions,
    createMultiAccount,
    createTransaction,
    deployCREContract,
  },
})

export default new GSchema({
  query: queries,
  mutation: mutations,
})
