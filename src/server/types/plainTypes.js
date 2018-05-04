import {
  GraphQLObjectType as Obj,
  GraphQLString as str,
  GraphQLList as List,
  GraphQLInt as int,
  GraphQLInputObjectType as InputObj,
  // GraphQLFloat as float,
  // GraphQLBoolean as bool,
} from 'graphql'

export const hashResult = new Obj({
  name: 'hashResult',
  description: '键值对结果',
  fields: {
    name: { type: str, description: '名称' },
    value: { type: str, description: '值' },
  },
})

export const balanceDetail = new Obj({
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

export const balanceFilter = new InputObj({
  name: 'balanceFilter',
  description: 'Balance 查询过滤条件',
  fields: {
    ethAddresses: { type: new List(str), description: '要查询的钱包地址' },
  },
})

export const batchTransactionTask = new Obj({
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

export const txRecord = new Obj({
  name: 'txOperationRecord',
  description: '转账记录',
  fields: {
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

export const txFilter = new InputObj({
  name: 'txFilter',
  description: 'transactionRecord 查询过滤条件',
  fields: {
    to: { type: str, description: '入账钱包地址' },
    amount: { type: int, description: '转账数量' },
    status: { type: int, description: '转账状态' },
    tokenType: { type: str, description: '代币类型' },
  },
})

