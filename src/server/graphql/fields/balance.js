import {
  GraphQLString as str,
  GraphQLFloat as float,
} from 'graphql'

import { connect } from '../../../framework/web3'
import { getTokenBalance } from '../../../utils/token'

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
