require('babel-register')({
  presets: ['es2015', 'stage-0'],
})

const { prizeInfoModel, txRecordModel } = require('../core/schemas')

prizeInfoModel
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
        from: 'unknow',
        to: ethAddress,
        status,
        txid,
        comment: '社区空投',
      })))
      .then(() => {
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

