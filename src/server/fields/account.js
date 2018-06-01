import {
  GraphQLString as str,
  GraphQLInt as int,
  GraphQLBoolean as bool,
  GraphQLList as List,
  GraphQLNonNull as NotNull,
} from 'graphql'

import { ethClientConnection } from '../../framework/web3'
import { ethAccountModel } from '../../core/schemas'

export const createAccount = {
  type: str,
  description: '创建钱包',
  args: {
    password: {
      type: str,
      description: '钱包密码',
    },
    comment: {
      type: str,
      description: '备注信息',
    },
  },
  resolve(root, { password = '', comment }) {
    return ethClientConnection
      .eth
      .personal
      .newAccount(password)
      // 将生成的钱包信息记录入库再返回
      .then(account => ethAccountModel.create({ account, secret: password }).then(() => account))
  },
}

export const createMultiAccount = {
  type: new List(str),
  description: '批量创建钱包',
  args: {
    amount: {
      type: new NotNull(int),
      description: '需要创建的钱包数量',
    },
    password: {
      type: str,
      description: '钱包密码',
    },
    comment: {
      type: str,
      description: '备注信息',
    },
  },
  resolve(root, { amount = 1, password = '', comment }) {
    let promises = []
    let addresses = []

    for (let index = 0; index < amount; index += 1) {
      promises.push(ethClientConnection.eth.personal.newAccount(password).then((addr) => { addresses.push(addr) }))
    }

    return Promise
      .all(promises)
      .then(() => ethAccountModel
        .insertMany(addresses.map(account => ({
          account,
          secret: password,
          comment,
        })))
        .then(() => addresses)
      )
  },
}

export const queryAccountList = {
  type: new List(str),
  description: '查看钱包地址',
  async resolve(root) {
    return ethAccountModel.find(null, 'account').then(t => t.map(({ account }) => account))
  },
}

export const queryIsSysAccount = {
  type: bool,
  description: '查询是否为系统地址',
  args: {
    address: {
      type: new NotNull(str),
      description: '指定地址',
    },
  },
  async resolve(root, { address }) {
    return ethAccountModel.findOne({ account: address }).then(res => !!res)
  },
}
