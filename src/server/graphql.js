import {
  GraphQLSchema as GSchema,
  GraphQLObjectType as Obj,
} from 'graphql'

import { USER_ROLE_LEVELS } from '../core/enums'
import { authLevelWrapper, sessionValidWrapper } from './common/auth'

import { exportAccountBalanceData } from './actions/excel'

import { createAdmin, adminLogin, adminLogout, changePwd, resetPwd, queryAdminList, getTwoFactorAuthUrl, bindTwoFactorAuth, getAdminInfo } from './actions/admin'

import { queryAllBalance, gatherAllTokens, tokenBalanceOverview } from './actions/balance'

import { queryCREContractAbi, deployCREContract, deployKycContract, deployAssetContract, addERC20ContractMeta, queryAllContract, readContractMethod, writeContractMethod } from './actions/contract'

import { statusEnum, tokenTypeEnum, userRoleEnum } from './actions/enum'

import { createAccount, createMultiAccount, queryAccountList, queryIsSysAccount } from './actions/account'

import { queryBatchTransactionTasks, queryTxRecordsViaTaskId, queryTx, createTransaction, createBatchTransactions, sendTransaction, editTransaction, removeTransaction } from './actions/transaction'

import { serverStates } from './actions/server'

const QueryApis = new Obj({
  name: 'QueryApis',
  description: '查询接口',
  fields: {
    adminLogin,
    adminLogout,
    queryAllBalance: sessionValidWrapper(queryAllBalance),
    queryAdminList: sessionValidWrapper(queryAdminList),
    queryAccountList: sessionValidWrapper(queryAccountList),
    queryCREContractAbi: sessionValidWrapper(queryCREContractAbi),
    queryBatchTransactionTasks: sessionValidWrapper(queryBatchTransactionTasks),
    queryAllContract: sessionValidWrapper(queryAllContract),
    queryTx: sessionValidWrapper(queryTx),
    queryTxRecordsViaTaskId: sessionValidWrapper(queryTxRecordsViaTaskId),
    queryIsSysAccount: sessionValidWrapper(queryIsSysAccount),
    queryServerStates: sessionValidWrapper(serverStates),
    getAdminInfo: sessionValidWrapper(getAdminInfo),
    getTwoFactorAuthUrl: sessionValidWrapper(getTwoFactorAuthUrl),
    tokenBalanceOverview: sessionValidWrapper(tokenBalanceOverview),
    statusEnum: sessionValidWrapper(statusEnum),
    tokenTypeEnum: sessionValidWrapper(tokenTypeEnum),
    userRoleEnum: sessionValidWrapper(userRoleEnum),
  },
})

const MutationApis = new Obj({
  name: 'MutationApis',
  description: '修改接口',
  fields: {
    changePwd: sessionValidWrapper(changePwd),
    createAdmin: authLevelWrapper([USER_ROLE_LEVELS.super_admin], createAdmin),
    addERC20ContractMeta: authLevelWrapper([USER_ROLE_LEVELS.super_admin], addERC20ContractMeta),
    createAccount: sessionValidWrapper(createAccount),
    createMultiAccount: sessionValidWrapper(createMultiAccount),
    createTransaction: sessionValidWrapper(createTransaction),
    createBatchTransactions: sessionValidWrapper(createBatchTransactions),
    deployCREContract: authLevelWrapper([USER_ROLE_LEVELS.super_admin], deployCREContract),
    deployKycContract: authLevelWrapper([USER_ROLE_LEVELS.super_admin], deployKycContract),
    deployAssetContract: authLevelWrapper([USER_ROLE_LEVELS.super_admin], deployAssetContract),
    sendTransaction: authLevelWrapper([USER_ROLE_LEVELS.super_admin], sendTransaction),
    editTransaction: sessionValidWrapper(editTransaction),
    removeTransaction: authLevelWrapper([USER_ROLE_LEVELS.super_admin], removeTransaction),
    readContractMethod: sessionValidWrapper(readContractMethod),
    writeContractMethod: authLevelWrapper([USER_ROLE_LEVELS.super_admin], writeContractMethod),
    gatherAllTokens: authLevelWrapper([USER_ROLE_LEVELS.super_admin], gatherAllTokens),
    bindTwoFactorAuth: sessionValidWrapper(bindTwoFactorAuth),
    exportAccountBalanceData: authLevelWrapper([USER_ROLE_LEVELS.super_admin], exportAccountBalanceData),
    resetPwd,
  },
})

export const defaultSchema = new GSchema({
  query: QueryApis,
  mutation: MutationApis,
})
