import {
  GraphQLInt as int,
  GraphQLString as str,
  GraphQLNonNull as NotNull,
  GraphQLList as List,
} from 'graphql'
import { TaskCapsule, ParallelQueue } from 'async-task-manager'

import { TOKEN_TYPES } from '../../core/enums'
import { EthAccountModel } from '../../core/schemas'
import { transferAllEth } from '../../core/scenes/token'
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
        tokenType: TOKEN_TYPES.cre,
        orderBy: TOKEN_TYPES.eth,
      },
    },
  },
  async resolve(root, { pageIndex = 0, pageSize = 10, filter }) {
    let listAccounts
    let { ethAddresses, orderBy, tokenType } = filter
    let queryCondition = null
    let sortCondition = { [`balances.${orderBy}`]: -1 }

    if (ethAddresses && ethAddresses.length > 0) {
      queryCondition = { account: { $in: ethAddresses } }
    }

    listAccounts = await EthAccountModel
      .find(queryCondition, { account: 1, balances: 1 })
      .sort(sortCondition)
      .skip(pageSize * pageIndex)
      .limit(pageSize)
      .then(accounts => accounts.map(({ account, balances }) => ({
        address: account,
        eth: balances[TOKEN_TYPES.eth] || 0,
        token: balances[tokenType] || 0,
      })))

    // 结果数量
    let total = await EthAccountModel.find(queryCondition, { _id: 1 }).count()
    return PaginationResult(listAccounts, pageIndex, pageSize, total)
  },
}

export const gatherAllEth = {
  type: str,
  description: '归集所有的以太',
  args: {
    gatherAddress: {
      type: new NotNull(str),
      description: '归集到的地址',
    },
    fromAddresses: {
      type: new List(str),
      description: '指定转出的系统地址，默认所有',
    },
  },
  async resolve(root, { gatherAddress, fromAddresses }) {
    let queryCondition = {}

    if (fromAddresses && fromAddresses.length > 0) {
      queryCondition = { account: { $in: fromAddresses } }
    }

    let validAccounts = await EthAccountModel
      .find(queryCondition, { account: 1, balances: 1 })
      .then(accounts => accounts.filter(({ account, balances }) => account !== gatherAddress && balances.eth > 0.001))

    if (validAccounts.length > 0) {
      let total = validAccounts.reduce((prev, { balances }) => prev + balances.eth, 0)
      let queue = new ParallelQueue({ limit: 5 })

      validAccounts.forEach(({ account }) => {
        queue.add(new TaskCapsule(() => transferAllEth(account, gatherAddress)))
      })

      return queue
        .consume()
        .then(() => `已发送 ${validAccounts.length} 个地址共计约 ${total} 以太到 ${gatherAddress}`)
        .catch(err => `执行归集任务失败 ${err.message}`)

    } else {
      return '没有需要归集的地址'
    }
  },
}
