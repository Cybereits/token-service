require('babel-register')({
  presets: ['es2015', 'stage-0'],
})

// 开启定时任务
require('./jobs')

