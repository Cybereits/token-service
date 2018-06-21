import {
  GraphQLObjectType as OutputObj,
  GraphQLString as str,
  GraphQLFloat as float,
  GraphQLList as List,
  GraphQLInt as int,
  GraphQLInputObjectType as InputObj,
  GraphQLNonNull as NotNull,
  GraphQLBoolean as boolean,
} from 'graphql'

import { getStatus } from '../../core/enums'

// #region Output Objects

export const contractMetaResult = new OutputObj({
  name: 'contractMetaResult',
  description: '合约元信息',
  fields: {
    name: {
      type: str,
      description: '合约名称',
    },
    symbol: {
      type: str,
      description: '代币缩写',
    },
    decimal: {
      type: int,
      description: '代币精度',
    },
    codes: {
      type: str,
      description: '合约编码',
    },
    abis: {
      type: str,
      description: '合约 abi',
    },
    owner: {
      type: str,
      description: '合约拥有者',
    },
    address: {
      type: str,
      description: '合约地址',
    },
    args: {
      type: str,
      description: '合约部署参数',
    },
    isERC20: {
      type: boolean,
      description: '是否是 ERC20 代币合约',
    },
    createAt: {
      type: str,
      description: '合约创建时间',
      resolve: c => (c.createAt).toJSON(),
    },
  },
})

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
    address: {
      type: str,
      description: '钱包地址',
    },
    eth: {
      type: float,
      description: 'eth 余额',
    },
    token: {
      type: float,
      description: '代币余额',
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
    count: {
      type: int,
      description: '任务包含的交易的数量',
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
      description: '转账数额',
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
    errorMsg: {
      type: str,
      description: '错误信息',
      resolve: t => t.exceptionMsg,
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

export const adminInfo = new OutputObj({
  name: 'adminInfo',
  description: '管理员账户信息',
  fields: {
    username: { type: str },
    role: { type: int },
  },
})

export const adminLogoutType = new OutputObj({
  name: 'loginout',
  description: '管理员登出',
  fields: {
    result: { type: boolean },
  },
})

// #endregion

// #region Input Objects

export const balanceFilter = new InputObj({
  name: 'balanceFilter',
  description: 'Balance 查询过滤条件',
  fields: {
    ethAddresses: { type: new List(str), description: '要查询的钱包地址' },
    orderBy: { type: str, description: '排序方式' },
    tokenType: { type: str, description: '查询的代币类型' },
  },
})

export const contractFilter = new InputObj({
  name: 'contractFilter',
  description: '合约查询过滤条件',
  fields: {
    name: { type: str, description: '合约名称' },
    symbol: { type: str, description: '代币缩写' },
    owner: { type: str, description: '所属地址' },
    address: { type: str, description: '合约地址' },
    isERC20: { type: boolean, description: '是否是 ERC20 代币合约' },
  },
})

export const txFilter = new InputObj({
  name: 'txFilter',
  description: 'transactionRecord 查询过滤条件',
  fields: {
    to: { type: str, description: '入账钱包地址' },
    amount: { type: int, description: '转账数额' },
    status: { type: str, description: '转账状态' },
    tokenType: { type: str, description: '代币类型' },
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

export const commonContractArgs = new InputObj({
  name: 'commonContractArgs',
  description: '通用合约参数',
  fields: {
    tokenSupply: { type: new NotNull(int), description: '代币总量' },
    tokenSymbol: { type: new NotNull(str), description: '代币缩写' },
    contractName: { type: new NotNull(str), description: '合约名称' },
    contractDecimals: { type: new NotNull(int), description: '合约精度' },
  },
})

  // #endregion
