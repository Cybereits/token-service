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

// 获取需要归集的钱包地址信息
export const getEthGatherAddrList = (amount) => {
  console.log(`${apiServer}/ethsend/${amount || ''}`)
  return request.get(`${apiServer}/ethsend/${amount || ''}`)
    .then((res) => {
      if (+res.code === 0) {
        return res['data']
      } else {
        throw new Error(`请求需要归集的 eth 钱包信息失败：${JSON.stringify(res, null, 4)}`)
      }
    })
}
