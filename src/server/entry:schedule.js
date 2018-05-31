require('babel-register')({
  presets: ['es2015', 'stage-0'],
})

const { syncTransaction, syncWallet } = require('./jobs')

// 开启同步交易信息任务
syncTransaction()
// 开启同步钱包信息任务
syncWallet()
