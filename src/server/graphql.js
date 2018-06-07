import {
  GraphQLSchema as GSchema,
  GraphQLObjectType as Obj,
} from 'graphql'

import { adminRegister, adminLogin, adminLogout } from './fields/admin'
import { queryAllBalance } from './fields/balance'
import { queryContractAbi, deployCREContract } from './fields/contract'
import { statusEnum, tokenTypeEnum, contractNameEnum } from './fields/enum'
import { createAccount, createMultiAccount, queryAccountList, queryIsSysAccount } from './fields/account'
import { queryBatchTrasactionTasks, queryTxRecordsViaTaskId, queryTx, createTransaction, createBatchTransactions, sendTransaction } from './fields/transactions'

const queries = new Obj({
  name: 'Queries',
  description: '查询接口',
  fields: {
    statusEnum,
    tokenTypeEnum,
    contractNameEnum,
    queryAccountList,
    queryAllBalance,
    queryContractAbi,
    queryBatchTrasactionTasks,
    queryTx,
    queryTxRecordsViaTaskId,
    queryIsSysAccount,
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
