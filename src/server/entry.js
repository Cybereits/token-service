require('babel-register')({
  presets: ['es2015', 'stage-0'],
})

require('./app')
// 开启定时任务
require('../core/jobs')
// 开启合约监听
require('../core/listeners')
