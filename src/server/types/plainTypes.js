import {
  GraphQLObjectType as OutputObj,
  GraphQLString as str,
  GraphQLList as List,
  GraphQLInt as int,
  GraphQLInputObjectType as InputObj,
  GraphQLEnumType,
  GraphQLNonNull as NotNull,
  GraphQLBoolean as boolean,
} from 'graphql'

import { getStatus, TOKEN_TYPE } from '../../core/enums'

// #region Output Objects
export const hashResult = new OutputObj({
  name: 'hashResult',
  description: '键值对结果',
  fields: {
    name: { type: str, description: '名称' },
    value: { type: str, description: '值' },
  },
})

export const userInfo = new OutputObj({
  name: 'userInfo',
  description: '用户信息',
  fields: {
    username: { type: str, description: '用户名' },
  },
})

export const balanceDetail = new OutputObj({
  name: 'balanceDetail',
  description: '账户详情',
  fields: {
    ethAddress: {
      type: str,
      description: '钱包地址',
    },
    balances: {
      type: new List(hashResult),
      description: '账户信息详情',
    },
  },
})

export const batchTransactionTask = new OutputObj({
  name: 'batchTransactionTask',
  description: '批量交易任务',
  fields: {
    id: {
      type: str,
      description: 'Identity',
      resolve: t => t._id,
    },
    amount: {
      type: int,
      description: '交易数量',
    },
    comment: {
      type: str,
      description: '任务描述',
    },
    createAt: {
      type: str,
      description: '创建时间',
      resolve: t => t.createAt.toJSON(),
    },
  },
})

export const txRecord = new OutputObj({
  name: 'txOperationRecord',
  description: '转账记录',
  fields: {
    id: {
      type: str,
      description: 'Identity',
      resolve: t => t._id,
    },
    amount: {
      type: int,
      description: '转账数量',
    },
    from: {
      type: str,
      description: '出账地址',
    },
    to: {
      type: str,
      description: '入账地址',
    },
    status: {
      type: str,
      resolve: ({ status }) => getStatus(status),
      description: '发送状态',
    },
    tokenType: {
      type: str,
      description: '代币类型',
    },
    comment: {
      type: str,
      description: '备注',
    },
    txid: {
      type: str,
      description: '转账记录的 TransactionId',
    },
    taskid: {
      type: str,
      description: '关联的任务ID',
    },
    sendTime: {
      type: str,
      description: 'Transaction 发出时间',
      resolve: (tx) => {
        if (tx.sendTime) {
          return tx.sendTime.toJSON()
        } else {
          return ''
        }
      },
    },
    confirmTime: {
      type: str,
      description: 'Transaction 确认时间',
      resolve: (tx) => {
        if (tx.confirmTime) {
          return tx.confirmTime.toJSON()
        } else {
          return ''
        }
      },
    },
  },
})
// #endregion

// #region Input Objects

/**
 * 这里需要的 values 的格式为
 * {
 *  eth: { value : 'eth' },
 *  cre: { value : 'cre' },
 *  eos: { value : 'eos' },
 * }
 */
export const TokenTypeEnum = new GraphQLEnumType({
  name: 'TokenTypeEnum',
  values: Object.entries(TOKEN_TYPE).reduce(
    (prev, [key, value]) => Object.assign(prev, { [key]: { value } }),
    {},
  ),
})

export const balanceFilter = new InputObj({
  name: 'balanceFilter',
  description: 'Balance 查询过滤条件',
  fields: {
    ethAddresses: { type: new List(str), description: '要查询的钱包地址' },
    orderBy: { type: TokenTypeEnum, description: '排序方式' },
  },
})

export const txFilter = new InputObj({
  name: 'txFilter',
  description: 'transactionRecord 查询过滤条件',
  fields: {
    to: { type: str, description: '入账钱包地址' },
    amount: { type: int, description: '转账数量' },
    status: { type: int, description: '转账状态' },
    tokenType: { type: TokenTypeEnum, description: '代币类型' },
  },
})

export const creContractArgs = new InputObj({
  name: 'creContractArgs',
  description: 'CRE 代币合约参数',
  fields: {
    tokenSupply: { type: new NotNull(int), description: '代币总量' },
    contractDecimals: { type: new NotNull(int), description: '合约精度' },
    lockPercent: { type: new NotNull(int), description: '团队锁仓百分比' },
    lockAddresses: { type: new List(str), description: '锁仓地址' },
  },
})

export const ethAccount = new InputObj({
  name: 'ethAccount',
  description: 'eth 账户信息',
  fields: {
    address: { type: new NotNull(str), description: '钱包地址' },
    secret: { type: str, description: '钱包创建时的密钥 (非私钥)', defaultValue: '' },
  },
})
// #endregion


//admin
export const amdinLoginType = new OutputObj({
  name: 'adminLogin',
  description: '管理员登录',
  fields: {
    username: { type: str },
    message: { type: str },
    role: { type: int },
  },
})

export const adminRegisterType = new OutputObj({
  name: 'adminRegister',
  description: '管理员注册',
  fields: {
    username: { type: str },
    role: { type: int },
    message: { type: str },
  },
})

export const adminLogoutType = new OutputObj({
  name: 'loginout',
  description: '管理员登出',
  fields: {
    result: { type: boolean },
  },
})
