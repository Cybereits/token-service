import mongoose from 'mongoose'

import connection from '../../framework/dbProviders/mongo'

const walletTransInfo = mongoose.Schema({
  address: {
    type: String,
    index: true,
    unique: true,
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
  // 钱包地址
  address: String,
  // 返还数量
  amount: Number,
  // 用户姓名
  name: String,
  // 邮箱地址
  email: String,
  // 手机
  mobile: String,
  // 代币类型
  coinType: String,
  // 状态
  // 0 表示待发送
  // 1 表示已发送
  // 2 表示已成功
  // -1 表示取消发送
  // -2 表示发送失败
  status: Number,
  // transaction hash
  txid: String,
  // 用户创建日期
  createdate: {
    type: Date,
    default: new Date(),
  },
})

const blockScanLog = mongoose.Schema({
  blockNum: {
    type: Number,
    index: true,
    unique: true,
  },
  scanTime: {
    type: Date,
    default: new Date(),
  },
})

export default {
  userReturnBackInfo: () => connection.model('userReturnBackInfo', userReturnBackInfo),
  walletTransInfo: () => connection.model('walletTransInfo', walletTransInfo),
  blockScanLog: () => connection.model('blockScanLog', blockScanLog),
}
