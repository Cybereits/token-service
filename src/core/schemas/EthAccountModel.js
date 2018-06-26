import mongoose from 'mongoose'

import connection from '../../framework/dbProviders/mongo'

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
  // 钱包的分组,即钱包客户端 ws 链接
  group: {
    type: String,
    required: true,
  },
  balances: {
    type: Object,
    default: {},
  },
  comment: {
    type: String,
  },
  createAt: {
    type: Date,
    default: () => new Date(),
  },
})

export default connection.model('ethAccount', ethAccount)
