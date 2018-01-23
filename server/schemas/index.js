import mongoose from 'mongoose'

import connection from '../../framework/dbProviders/mongo'

const walletTransInfo = mongoose.Schema({
  address: {
    type: String,
    index: true,
  },
  eth: Number,
  cre: Number,
  trans: [{
    block: Number,
    txid: String,
    from: String,
    to: String,
    cumulativeGasUsed: Number,
    gasUsed: Number,
    ethTransferred: Number,
    tokenTransferred: Number,
  }],
})

const userReturnBackInfo = mongoose.Schema({
  // 引用id
  refId: {
    type: Number,
    index: true,
  },
  // 白名单注册的用户钱包地址
  regAddress: String,
  // 系统分配的钱包地址
  sysAddress: String,
  // 注册数量
  regAmount: Number,
  // 系统接收数量
  acceptAmount: Number,
  // 客户转入数量
  receiveAmount: Number,
  // 返还数量
  returnAmount: Number,
  // 用户姓名
  name: String,
  // 邮箱地址
  email: String,
  // 手机
  mobile: String,
  // 代币类型
  coinType: String,
  // 状态
  status: Number,
  // transaction hash
  txid: String,
  // 用户创建日期
  createdate: {
    type: Date,
    default: Date.now(),
  },
})

export default {
  userReturnBackInfo: () => connection.model('userReturnBackInfo', userReturnBackInfo),
  walletTransInfo: () => connection.model('walletTransInfo', walletTransInfo),
}
