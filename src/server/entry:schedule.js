require('babel-register')({
  presets: ['es2015', 'stage-0'],
})

const { schedule } = require('../config/env')

if (schedule.includes('cre')) {
  require('./jobs').creServerSchedule()
}

if (schedule.includes('eth')) {
  require('./jobs').ethServerSchedule()
}
