require('babel-register')({
  presets: ['es2015', 'stage-0'],
})

const mongoose = require('mongoose')
const connection = require('../framework/dbProviders/mongo').default

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
    required: true,
  },
  // 发送的转账交易 ID
  txid: String,
})

const obsoletePrizeInfoModel = connection.model('prizeInfo', prizeInfo)

const { txRecordModel } = require('../core/schemas')

obsoletePrizeInfoModel
  .find()
  .then((infoCollection) => {
    txRecordModel
      .insertMany(infoCollection.map(({
        // 接受代币的地址
        ethAddress,
        // 奖励数量
        prize,
        // 发放状态
        status,
        // 发送的转账交易 ID
        txid,
      }) => ({
        amount: prize,
        from: '0x69a936576fdd16c106f82f6286d0f844b861949b',
        to: ethAddress,
        status,
        txid,
        comment: '社区空投',
      })))
      .then(() => {
        console.info('数据迁移成功')
        process.exit(0)
      })
      .catch((ex) => {
        console.error(ex)
        process.exit(-1)
      })
  })
  .catch((ex) => {
    console.error(ex)
    process.exit(-1)
  })

