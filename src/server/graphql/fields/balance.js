import {
  GraphQLString as str,
  GraphQLFloat as float,
  GraphQLList as List,
} from 'graphql'

import { connect } from '../../../framework/web3'
import { getTokenBalance } from '../../../utils/token'
import { balanceDetail } from '../types/plainTypes'

export const queryTokenBalance = {
  type: float,
  description: '查询账户代币余额',
  args: {
    address: {
      type: str,
      description: '要查询的地址',
    },
  },
  async resolve(root, { address }) {
    return getTokenBalance(address)
  },
}

export const queryEthBalance = {
  type: float,
  description: '查询账户 ETH 余额',
  args: {
    address: {
      type: str,
      description: '要查询的地址',
    },
  },
  async resolve(root, { address }) {
    let _balance = await connect.eth.getBalance(address)
    return connect.eth.extend.utils.fromWei(_balance, 'ether')
  },
}

export const queryAllBalance = {
  type: new List(balanceDetail),
  description: '查询账户下的代币余额',
  args: {
    address: {
      type: str,
      description: '要查询的地址',
    },
  },
  async resolve(root, { address }) {
    let listAccounts = await connect.eth.getAccounts()
    let result = []
    let promises = listAccounts.map(address => new Promise(async (resolve, reject) => {
      let amount = await connect.eth.getBalance(address).catch(reject)
      let creAmount = await getTokenBalance(address).catch(reject)
      let ethAmount = connect.eth.extend.utils.fromWei(amount, 'ether')
      result.push({
        ethAddress: address,
        balances: [
          { name: 'eth', value: ethAmount },
          { name: 'cre', value: creAmount },
        ],
      })
      resolve()
    }))

    return Promise.all(promises).then(() => result)
  },
}
