import {
  GraphQLString as str,
  GraphQLInt as int,
  GraphQLList as List,
  GraphQLNonNull as NotNull,
} from 'graphql'

import { connect } from '../../framework/web3'

export const createAccount = {
  type: str,
  description: '创建钱包地址',
  async resolve(root) {
    return connect.eth.personal.newAccount()
  },
}

export const createMultiAccount = {
  type: new List(str),
  description: '批量创建钱包地址',
  args: {
    amount: {
      type: new NotNull(int),
      description: '需要创建的钱包数量',
    },
  },
  async resolve(root, { amount = 1 }) {
    let promises = []
    let addresses = []
    for (let index = 0; index < amount; index += 1) {
      promises.push(connect.eth.personal.newAccount().then((addr) => { addresses.push(addr) }))
    }
    return Promise.all(promises).then(() => addresses)
  },
}

export const queryAccountList = {
  type: new List(str),
  description: '查看钱包地址',
  async resolve(root) {
    return connect.eth.getAccounts()
  },
}
