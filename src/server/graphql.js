import {
  GraphQLSchema as GSchema,
  GraphQLObjectType as Obj,
} from 'graphql'

import { adminRegister, adminLogin, adminLogout } from './fields/admin'
import { queryAllBalance, gatherAllEth } from './fields/balance'
import { queryContractAbi, deployCREContract, addERC20ContractMeta, unlockTeamAllocation } from './fields/contract'
import { statusEnum, tokenTypeEnum } from './fields/enum'
import { createAccount, createMultiAccount, queryAccountList, queryIsSysAccount } from './fields/account'
import { queryBatchTrasactionTasks, queryTxRecordsViaTaskId, queryTx, createTransaction, createBatchTransactions, sendTransaction } from './fields/transactions'

const queries = new Obj({
  name: 'Queries',
  description: '查询接口',
  fields: {
    adminLogin,
    adminLogout,
    queryAccountList,
    queryAllBalance,
    queryContractAbi,
    queryBatchTrasactionTasks,
    queryTx,
    queryTxRecordsViaTaskId,
    queryIsSysAccount,
    statusEnum,
    tokenTypeEnum,
  },
})

const mutations = new Obj({
  name: 'Mutations',
  description: '修改接口',
  fields: {
    adminRegister,
    addERC20ContractMeta,
    createAccount,
    createBatchTransactions,
    createMultiAccount,
    createTransaction,
    deployCREContract,
    sendTransaction,
    unlockTeamAllocation,
    gatherAllEth,
  },
})

export default new GSchema({
  query: queries,
  mutation: mutations,
})
