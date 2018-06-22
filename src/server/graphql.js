import {
  GraphQLSchema as GSchema,
  GraphQLObjectType as Obj,
} from 'graphql'

import { createAdmin, adminLogin, adminLogout, changePwd, queryAdminList } from './fields/admin'
import { queryAllBalance, gatherAllEth } from './fields/balance'
import { queryCREContractAbi, deployCREContract, deployKycContract, deployAssetContract, addERC20ContractMeta, queryAllContract, callContractMethod } from './fields/contract'
import { statusEnum, tokenTypeEnum } from './fields/enum'
import { createAccount, createMultiAccount, queryAccountList, queryIsSysAccount } from './fields/account'
import { queryBatchTransactionTasks, queryTxRecordsViaTaskId, queryTx, createTransaction, createBatchTransactions, sendTransaction } from './fields/transactions'

const queries = new Obj({
  name: 'Queries',
  description: '查询接口',
  fields: {
    adminLogin,
    adminLogout,
    queryAdminList,
    queryAccountList,
    queryAllBalance,
    queryCREContractAbi,
    queryBatchTransactionTasks,
    queryAllContract,
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
    createAdmin,
    changePwd,
    addERC20ContractMeta,
    createAccount,
    createBatchTransactions,
    createMultiAccount,
    createTransaction,
    deployCREContract,
    deployKycContract,
    deployAssetContract,
    sendTransaction,
    callContractMethod,
    gatherAllEth,
  },
})

export default new GSchema({
  query: queries,
  mutation: mutations,
})
