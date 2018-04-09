import {
  GraphQLString as str,
  GraphQLList as List,
} from 'graphql'

import { connect } from '../../../framework/web3'

export const createAccount = {
  type: str,
  description: '创建钱包地址',
  async resolve(root) {
    return connect.eth.personal.newAccount()
  },
}

export const getAccountList = {
  type: new List(str),
  description: '查看钱包地址',
  async resolve(root) {
    return connect.eth.getAccounts()
  },
}
