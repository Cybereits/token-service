import {
  GraphQLInt as int,
  GraphQLString as str,
  GraphQLNonNull as NotNull,
  GraphQLList as List,
} from 'graphql'
import { TaskCapsule, ParallelQueue } from 'async-task-manager'

import { TOKEN_TYPES } from '../../core/enums'
import { EthAccountModel, BatchTransactinTaskModel } from '../../core/schemas'
import { transferAllEth, transferAllTokens } from '../../core/scenes/token'
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
        tokenType: TOKEN_TYPES.eth,
      },
    },
  },
  async resolve(root, { pageIndex = 0, pageSize = 10, filter }) {
    let listAccounts
    let { ethAddresses, tokenType } = filter
    let queryCondition = null
    let sortCondition = { [`balances.${tokenType}`]: -1 }

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

export const tokenBalanceOverview = {
  type: str,
  description: '获取代币余额总览',
  args: {
    tokenType: str,
    description: '代币类型',
  },
  async resolve() {
    // todo
    return 'todo...'
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
  async resolve(root, { gatherAddress, fromAddresses }, { session }) {
    let queryCondition = {}

    if (fromAddresses && fromAddresses.length > 0) {
      queryCondition = { account: { $in: fromAddresses } }
    }

    let validAccounts = await EthAccountModel
      .find(queryCondition, { account: 1, balances: 1 })
      .then(accounts => accounts.filter(({ account, balances }) => account !== gatherAddress && balances.eth > 0.001))

    if (validAccounts.length > 0) {
      // 先创建任务实体
      let task = await BatchTransactinTaskModel.create({
        count: validAccounts.length,
        comment: `归集 ${validAccounts.length} 个地址的 ETH 到 ${gatherAddress}`,
      })

      let queue = new ParallelQueue({ limit: 15 })

      validAccounts.forEach(({ account }) => {
        queue.add(new TaskCapsule(() => transferAllEth(account, gatherAddress, task._id, session.admin.username)))
      })

      return queue.consume()
        .then(() => '成功创建 ETH 归集任务')
        .catch(err => `创建 ETH 归集任务失败 ${err.message}`)

    } else {
      return new Error('没有需要归集的地址')
    }
  },
}

export const gatherAllTokens = {
  type: str,
  description: '归集所有代币',
  args: {
    gatherAddress: {
      type: new NotNull(str),
      description: '归集到的地址',
    },
    fromAddresses: {
      type: new List(str),
      description: '指定转出的系统地址，默认所有',
    },
    tokenType: {
      type: str,
      description: '代币类型，默认 cre',
    },
  },
  async resolve(root, { gatherAddress, fromAddresses, tokenType = TOKEN_TYPES.cre }, { session }) {
    let queryCondition = {}

    if (fromAddresses && fromAddresses.length > 0) {
      queryCondition = { account: { $in: fromAddresses } }
    }

    let validAccounts = await EthAccountModel
      .find(queryCondition, { account: 1, balances: 1 })
      .then(accounts => accounts.filter(({ account, balances }) => account !== gatherAddress && balances[tokenType] > 0.001))

    if (validAccounts.length > 0) {

      // 先创建任务实体
      let task = await BatchTransactinTaskModel.create({
        count: validAccounts.length,
        comment: `归集 ${validAccounts.length} 个地址的 ${tokenType} 到 ${gatherAddress}`,
      })

      let queue = new ParallelQueue({ limit: 15 })

      validAccounts.forEach(({ account }) => {
        queue.add(new TaskCapsule(() => transferAllTokens(account, gatherAddress, tokenType, task._id, session.admin.username)))
      })

      return queue.consume()
        .then(() => `成功创建 ${tokenType} 归集任务`)
        .catch(err => `创建 ${tokenType} 归集任务失败 ${err.message}`)

    } else {
      return new Error('没有需要归集的地址')
    }
  },
}
