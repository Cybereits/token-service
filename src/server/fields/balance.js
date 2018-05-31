import {
  GraphQLInt as int,
} from 'graphql'

import { ethClientConnection } from '../../framework/web3'
import { getTokenBalance } from '../../core/scenes/token'
import { balanceDetail, balanceFilter, CoinTypes } from '../types/plainTypes'
import { PaginationWrapper, PaginationResult } from '../types/complexTypes'

function sortBalances(balances, tokenName) {
  return balances.sort((prev, next) => next.balances.filter(t => t.name === tokenName)[0].value - prev.balances.filter(t => t.name === tokenName)[0].value)
}

export const queryAllBalance = {
  type: PaginationWrapper(balanceDetail),
  description: '查询账户下的代币余额',
  args: {
    pageIndex: {
      type: int,
      description: '页码',
    },
    pageSize: {
      type: int,
      description: '页容',
    },
    filter: {
      type: balanceFilter,
      description: '过滤条件',
      defaultValue: {
        orderBy: CoinTypes.getValue('ETH').value,
      },
    },
  },
  async resolve(root, { pageIndex = 0, pageSize = 10, filter }) {
    let listAccounts
    let { ethAddresses, orderBy } = filter
    if (ethAddresses && ethAddresses.length > 0) {
      listAccounts = filter.ethAddresses
    } else {
      listAccounts = await ethClientConnection.eth.getAccounts()
    }
    let total = listAccounts.length
    listAccounts = listAccounts.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize)
    let result = []
    let promises = listAccounts.map(address => new Promise(async (resolve, reject) => {
      let amount = await ethClientConnection.eth.getBalance(address).catch(reject)
      let creAmount = await getTokenBalance(address).catch(reject)
      let ethAmount = ethClientConnection.eth.extend.utils.fromWei(amount, 'ether')
      result.push({
        ethAddress: address,
        balances: [
          { name: 'eth', value: ethAmount },
          { name: 'cre', value: creAmount },
        ],
      })
      resolve()
    }))

    return Promise.all(promises).then(() => {
      sortBalances(result, orderBy)
      return PaginationResult(result, pageIndex, pageSize, total)
    })
  },
}
