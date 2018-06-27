import {
  GraphQLSchema as GSchema,
  GraphQLObjectType as Obj,
} from 'graphql'

import { createAdmin, adminLogin, adminLogout, changePwd, queryAdminList, getTwoFactorAuthUrl, bindTwoFactorAuth, getAdminInfo } from './fields/admin'
import { queryAllBalance, gatherAllEth } from './fields/balance'
import { queryCREContractAbi, deployCREContract, deployKycContract, deployAssetContract, addERC20ContractMeta, queryAllContract, callContractMethod } from './fields/contract'
import { statusEnum, tokenTypeEnum } from './fields/enum'
import { createAccount, createMultiAccount, queryAccountList, queryIsSysAccount } from './fields/account'
import { queryBatchTransactionTasks, queryTxRecordsViaTaskId, queryTx, createTransaction, createBatchTransactions, sendTransaction } from './fields/transactions'

const authRequiredQueries = new Obj({
  name: 'AuthRequiredQueries',
  description: '需要权限的查询接口',
  fields: {
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
    getAdminInfo,
    getTwoFactorAuthUrl,
    statusEnum,
    tokenTypeEnum,
  },
})

const authRequiredMutations = new Obj({
  name: 'AuthRequiredMutations',
  description: '需要权限的修改接口',
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
    bindTwoFactorAuth,
  },
})

const publicQueries = new Obj({
  name: 'PublicQueries',
  description: '公开查询接口',
  fields: {
    adminLogin,
  },
})

export const authSchema = new GSchema({
  query: authRequiredQueries,
  mutation: authRequiredMutations,
})

export const publicSchema = new GSchema({
  query: publicQueries,
})
