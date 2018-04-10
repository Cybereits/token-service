import mongoose from 'mongoose'

import connection from '../framework/dbProviders/mongo'
import { STATUS, PRIZE_TYPES } from './enums'

// 钱包转账信息
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

// 交易记录信息
const transactionInfo = mongoose.Schema({
  block: Number,
  txid: {
    type: String,
    index: true,
    unique: true,
  },
  from: {
    type: String,
    index: true,
  },
  to: {
    type: String,
    index: true,
  },
  cumulativeGasUsed: Number,
  gasUsed: Number,
  ethTransferred: Number,
  tokenTransferred: Number,
})

// 用户退币信息
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

// 合约交易信息的区块扫描信息
const blockScanLogForContract = mongoose.Schema({
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

// 所有交易的区块扫描信息
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

// 奖励信息
const prizeInfo = mongoose.Schema({
  // 钱包地址
  ethAddress: {
    type: String,
    index: true,
    required: true,
  },
  // 奖励数量
  prize: {
    type: Number,
    required: true,
  },
  // 发放状态
  status: {
    type: Number,
    default: STATUS.pending,
    required: true,
  },
  // 奖励类型
  type: {
    type: String,
    default: PRIZE_TYPES.default,
    required: true,
  },
  // 发送的转账交易 ID
  txid: {
    type: String,
  },
})

export default {
  userReturnBackInfo: () => connection.model('userReturnBackInfo', userReturnBackInfo),
  walletTransInfo: () => connection.model('walletTransInfo', walletTransInfo),
  blockScanLogForContract: () => connection.model('blockScanLogForContract', blockScanLogForContract),
  blockScanLog: () => connection.model('blockScanLog', blockScanLog),
  prizeInfo: () => connection.model('prizeInfo', prizeInfo),
  transactionInfo: () => connection.model('transactionInfo', transactionInfo),
}
