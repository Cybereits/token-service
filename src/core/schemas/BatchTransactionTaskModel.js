import mongoose from 'mongoose'

import connection from '../../framework/dbProviders/mongo'

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
    default: () => new Date(),
  },
})

export default connection.model('batchTransactionTask', batchTask)
