import {
  GraphQLInt as int,
} from 'graphql'

import { ethWalletConnect } from '../../framework/web3'
// import { getTokenBalance } from '../../core/scenes/token'
import { balanceDetail, balanceFilter } from '../types/plainTypes'
import { PaginationWrapper, PaginationResult } from '../types/complexTypes'

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
    },
  },
  async resolve(root, { pageIndex = 0, pageSize = 10, filter }) {
    let listAccounts
    if (filter && filter.ethAddresses && filter.ethAddresses.length > 0) {
      listAccounts = filter.ethAddresses
    } else {
      listAccounts = await ethWalletConnect.eth.getAccounts()
    }
    let total = listAccounts.length
    listAccounts = listAccounts.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize)
    let result = []
    let promises = listAccounts.map(address => new Promise(async (resolve) => {
      let amount = await ethWalletConnect.eth.getBalance(address).catch((ex) => { throw ex })
      // let creAmount = await getTokenBalance(address).catch((ex) => { throw ex })
      let ethAmount = ethWalletConnect.eth.extend.utils.fromWei(amount, 'ether')
      result.push({
        ethAddress: address,
        balances: [
          { name: 'eth', value: ethAmount },
          // { name: 'cre', value: creAmount },
        ],
      })
      resolve()
    }))

    return Promise.all(promises).then(() => PaginationResult(result, pageIndex, pageSize, total))
  },
}
