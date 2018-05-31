import {
  GraphQLString as str,
  GraphQLInt as int,
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
      .then(
        account => ethAccountModel
          .create({
            account,
            secret: password,
          })
          .then(() => account)
      )
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
      .then(() => {
        console.log(addresses.map(account => ({
          account,
          secret: password,
          comment,
        })))
        return ethAccountModel
          .insertMany(addresses.map(account => ({
            account,
            secret: password,
            comment,
          })))
          .then(() => addresses)
      })
  },
}

export const queryAccountList = {
  type: new List(str),
  description: '查看钱包地址',
  async resolve(root) {
    return ethClientConnection.eth.getAccounts()
  },
}
