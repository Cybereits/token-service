import mongoose from 'mongoose'

import connection from '../../framework/dbProviders/mongo'

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
  // 是否是 ERC20 代币合约
  isERC20: {
    type: Boolean,
    default: false,
  },
  // 创建时间
  createAt: {
    type: Date,
    default: new Date(),
  },
})

export default connection.model('contractMeta', contractMeta)
