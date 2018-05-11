import mongoose from 'mongoose'

import connection from '../framework/dbProviders/mongo'
import { STATUS, TOKEN_TYPE } from './enums'

// 批量交易任务（发送cre、eth）等
const batchTask = mongoose.Schema({
  // 批处理数量
  amount: {
    type: Number,
    required: true,
  },
  // 任务备注
  comment: {
    type: String,
    required: true,
  },
  // 任务创建时间
  createAt: {
    type: Date,
    default: new Date(),
  },
})
export const batchTransactinTaskModel = connection.model('batchTransactionTask', batchTask)

// 合约元数据
const contractMeta = mongoose.Schema({
  name: {
    type: String,
    unique: true,
    index: true,
    required: true,
  },
  code: [String],
  abi: [String],
  address: [String],
  subContractAddress: [String],
  createAt: {
    type: Date,
    default: new Date(),
  },
})
export const contractMetaModel = connection.model('contractMeta', contractMeta)

// 交易操作记录
const transactionRecord = mongoose.Schema({
  // 转账数量
  amount: {
    type: Number,
    required: true,
  },
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
  // 发放状态
  status: {
    type: Number,
    default: STATUS.pending,
    required: true,
  },
  // 代币类型
  tokenType: {
    type: String,
    required: true,
    default: TOKEN_TYPE.cre,
  },
  // 关联任务 ID
  taskid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'batchTransactionTask',
  },
  txid: String,
  // 备注
  comment: String,
  // 交易发送时间
  sendTime: Date,
  // 交易确认时间
  confirmTime: Date,
})
export const txRecordModel = connection.model('transactionRecord', transactionRecord)

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
  // 发送的转账交易 ID
  txid: String,
})
export const prizeInfoModel = connection.model('prizeInfo', prizeInfo)
