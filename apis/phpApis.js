import request from '../framework/request'
import { apiServer } from '../config/env'

// 同步本地 geth 客户端记录到的钱包 eth 账户信息
export const postBalances = balanceArr => request.post(`${apiServer}/walet`, {
  data: balanceArr,
})

// 同步 etherscan 接口查询到的本地账户 eth 转账信息
export const postTransactions = transactionList => request.post(`${apiServer}/trans`, {
  data: transactionList,
})

// 获取要分发的代币数据
export const getDistributeTokenInfo = () => request.get(`${apiServer}/dicoin`)
  .then((res) => {
    if (+res.code === 0) {
      return res['data']
    } else {
      throw new Error(`请求代币分发信息接口出错:${JSON.stringify(res, null, 4)}`)
    }
  })

// 获取已分发的代币数据
export const getDistributeSentInfo = () => request.get(`${apiServer}/cresending`)
  .then((res) => {
    if (+res.code === 0) {
      return res['data']
    } else {
      throw new Error(`请求代币分发信息接口出错:${JSON.stringify(res, null, 4)}`)
    }
  })

// 同步代币已发送信息
export const syncTokenSent = addrCollection => request.post(`${apiServer}/cresending`, {
  data: addrCollection,
})

// 同步代币发送成功信息
export const syncTokenSendingSucc = addrCollection => request.post(`${apiServer}/cresuccess`, {
  data: addrCollection,
})

// 获取退回 eth 的用户信息
export const getEthReturnBackInfo = () => request.get(`${apiServer}/eth_return`)
  .then((res) => {
    if (+res.code === 0) {
      return res['data']
    } else {
      throw new Error(`请求退回 eth 的用户信息出错:${JSON.stringify(res, null, 4)}`)
    }
  })

// 同步返还 eth 的交易已发送的状态
export const syncReturnBackTransactionSentStatus = ids => request.post(`${apiServer}/eth_sending`, {
  data: ids,
})
