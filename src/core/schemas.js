import mongoose from 'mongoose'

import connection from '../framework/dbProviders/mongo'
import { STATUS, PRIZE_TYPES, TOKEN_TYPE } from './enums'

// 合约信息
const contractInfo = mongoose.Schema({
  // 合约名称
  name: {
    type: String,
    index: true,
    unique: true,
  },
  // 代币名称
  tokenName: {
    type: String,
  },
  // 合约 code
  code: {
    type: [String],
  },
  // 合约 abi
  abi: {
    type: [String],
  },
  // 合约部署地址
  address: {
    type: [String],
    required: true,
  },
  // 子合约信息
  subContracts: {
    type: [contractInfo],
  },
  // 创建时间
  createAt: {
    type: Date,
    default: new Date(),
  },
})

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

// 扫描区块获得的交易记录信息
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

// 交易操作记录
const txOperationRecord = mongoose.Schema({
  // 转出地址
  from: {
    type: String,
    index: true,
    required: true,
  },
  // 转入地址
  to: {
    type: String,
    index: true,
    required: true,
  },
  // 转账数量
  amount: {
    type: Number,
    required: true,
  },
  // 代币类型
  tokenType: {
    type: String,
    required: true,
    default: TOKEN_TYPE.cre,
  },
  // 备注
  comment: String,
})

// 批量交易任务（发送cre、eth）等
const batchTxTask = mongoose.Schema({
  // 批处理数量
  amount: {
    type: Number,
    required: true,
  },
  // 细节内容
  details: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'transactionOperationRecord' }],
    required: true,
  },
  // 任务类型
  type: {
    type: String,
    required: true,
  },
  // 任务创建时间
  createAt: {
    type: Date,
    default: new Date(),
  },
})

export const contractInfoModel = connection.model('contractInfo', contractInfo)
export const userReturnBackInfoModel = connection.model('userReturnBackInfo', userReturnBackInfo)
export const walletTransInfoModel = connection.model('walletTransInfo', walletTransInfo)
export const blockScanLogForContractModel = connection.model('blockScanLogForContract', blockScanLogForContract)
export const blockScanLogModel = connection.model('blockScanLog', blockScanLog)
export const prizeInfoModel = connection.model('prizeInfo', prizeInfo)
export const transactionInfoModel = connection.model('transactionInfo', transactionInfo)
export const txOperationRecordModel = connection.model('transactionOperationRecord', txOperationRecord)
export const batchTransactinTaskModel = connection.model('batchTransactionTask', batchTxTask)
