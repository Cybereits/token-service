import mongoose from 'mongoose'

import connection from '../framework/dbProviders/mongo'
import { STATUS, PRIZE_TYPES, TOKEN_TYPE } from './enums'

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

export const batchTransactinTaskModel = connection.model('batchTransactionTask', batchTxTask)
export const prizeInfoModel = connection.model('prizeInfo', prizeInfo)
export const txOperationRecordModel = connection.model('transactionOperationRecord', txOperationRecord)
export const userReturnBackInfoModel = connection.model('userReturnBackInfo', userReturnBackInfo)
