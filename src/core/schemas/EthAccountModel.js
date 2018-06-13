import mongoose from 'mongoose'

import connection from '../../framework/dbProviders/mongo'

// const balanceInfo = mongoose.Schema({
//   symbol: String,
//   amount: Number,
// })

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
  balances: {
    type: Object,
    default: {},
  },
  comment: {
    type: String,
  },
  createAt: {
    type: Date,
    default: new Date(),
  },
})

export default connection.model('ethAccount', ethAccount)
