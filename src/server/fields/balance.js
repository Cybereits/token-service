import {
  GraphQLInt as int,
} from 'graphql'

import { TOKEN_TYPE } from '../../core/enums'
import { ethAccountModel } from '../../core/schemas'
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
      defaultValue: {
        orderBy: TOKEN_TYPE.eth,
      },
    },
  },
  async resolve(root, { pageIndex = 0, pageSize = 10, filter }) {
    let listAccounts
    let { ethAddresses, orderBy } = filter
    let queryCondition = null
    let sortCondition = orderBy === TOKEN_TYPE.eth ? { ethAmount: -1 } : { creAmount: -1 }

    if (ethAddresses && ethAddresses.length > 0) {
      queryCondition = { account: { $in: ethAddresses } }
    }

    listAccounts = await ethAccountModel
      .find(queryCondition, { account: 1, creAmount: 1, ethAmount: 1 })
      .sort(sortCondition)
      .then(accounts => accounts.map(({ account, creAmount, ethAmount }) => ({
        ethAddress: account,
        balances: [
          { name: 'eth', value: ethAmount },
          { name: 'cre', value: creAmount },
        ],
      })))

    // 结果数量
    let total = listAccounts.length
    // 分页数据
    listAccounts = listAccounts.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize)
    return PaginationResult(listAccounts, pageIndex, pageSize, total)
  },
}
