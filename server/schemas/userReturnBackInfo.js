import mongoose from 'mongoose'

import connection from '../../framework/dbProviders/mongo'

const userReturnBackInfo = mongoose.Schema({
  // 引用id
  refId: Number,
  // 钱包地址
  address: String,
  // 代币数量
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
  status: Number,
  // transaction hash
  txid: String,
  // 用户创建日期
  createdate: {
    type: Date,
    default: Date.now(),
  },
})

export default () => connection.model('userReturnBackInfo', userReturnBackInfo)
