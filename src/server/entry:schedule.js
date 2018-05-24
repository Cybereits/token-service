require('babel-register')({
  presets: ['es2015', 'stage-0'],
})

const { schedule } = require('../config/env.json')

if (schedule.includes('wallet')) {
  require('./jobs').syncWallet()
}

if (schedule.includes('tx')) {
  require('./jobs').syncTransaction()
}
