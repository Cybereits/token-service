import {
  GraphQLSchema as GSchema,
  GraphQLObjectType as Obj,
} from 'graphql'

import { createAccount, createMultiAccount, queryAccountList, queryIsSysAccount } from './fields/account'
import { queryAllBalance } from './fields/balance'
import { commonStatusEnum } from './fields/enum'
import { queryContractAbi, deployCREContract } from './fields/contract'
import {
  queryBatchTrasactionTasks,
  queryTxRecordsViaTaskId,
  queryTx,
  createTransaction,
  createBatchTransactions,
  sendTransaction,
} from './fields/transactions'
import {
    adminRegister, 
    adminLogin,
    adminLogout,
} from './fields/admin'

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
    adminLogin,
    adminLogout,
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
    sendTransaction,
    adminRegister,
  },
})

export default new GSchema({
  query: queries,
  mutation: mutations,
})
