import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

import connection from '../framework/dbProviders/mongo'
import { STATUS, TOKEN_TYPE } from './enums'

const SALT_WORK_FACTOR = 10

// 用户信息
const user = mongoose.Schema({
  username: {
    type: String,
    unique: true,
    index: true,
    required: true,
  },
  secret: {
    type: String,
    required: true,
  },
  enabled: {
    type: Boolean,
    default: true,
  },
  createAt: {
    type: Date,
    default: new Date(),
  },
})
export const userModel = connection.model('userInfo', user)

// 钱包信息
const ethAccount = mongoose.Schema({
  account: {
    type: String,
    unique: true,
    index: true,
    required: true,
  },
  secret: {
    type: String,
    default: '',
  },
  group: {
    type: String,
    default: 'normal',
  },
  creAmount: {
    type: Number,
    default: 0,
  },
  ethAmount: {
    type: Number,
    default: 0,
  },
  comment: {
    type: String,
  },
  createAt: {
    type: Date,
    default: new Date(),
  },
})
export const ethAccountModel = connection.model('ethAccount', ethAccount)

// 批量交易任务
const batchTask = mongoose.Schema({
  // 批处理数量
  count: {
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
  // 合约名称
  name: {
    type: String,
    unique: true,
    index: true,
    required: true,
  },
  // ERC20 代币精度 (可选)
  decimal: {
    type: Number,
    default: 18,
  },
  // Contract Creation Code
  codes: String,
  // Contract ABI
  abis: String,
  // 合约拥有者地址
  owner: String,
  // 合约部署地址
  address: String,
  // 合约部署时的参数列表
  args: String,
  // 创建时间
  createAt: {
    type: Date,
    default: new Date(),
  },
})
export const contractMetaModel = connection.model('contractMeta', contractMeta)

// 交易操作记录
const transactionRecord = mongoose.Schema({
  // 转账数额
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
  // 异常信息
  exceptionMsg: String,
  // 交易发送时间
  sendTime: Date,
  // 交易确认时间
  confirmTime: Date,
})
export const txRecordModel = connection.model('transactionRecord', transactionRecord)

// admin
const adminUser = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: { // 1:超级管理员，2:普通管理员
    type: Number,
    default: 2,
  },
})
adminUser.pre('save', function (next) {
  let admin = this

  if (!admin.isModified('password')) return next()

  bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
    if (err) return next(err)
    bcrypt.hash(admin.password, salt, (err, hash) => {
      if (err) return next(err)
      admin.password = hash
      next()
    })
  })
})

adminUser.methods = {
  comparePassword: function (_password, password) {
    return new Promise((resolve, reject) => {
      bcrypt.compare(_password, password, (err, isMath) => {
        if (err) reject(err)
        else resolve(isMath)
      })
    })
  },
}

export const AdminModel = connection.model('adminUser', adminUser)
