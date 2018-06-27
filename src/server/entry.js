require('babel-register')({
  presets: [
    [
      'env',
      {
        'targets': {
          'node': 'current',
        },
      },
    ],
  ],
})

require('./app')
// 开启定时任务
require('../core/jobs')
// 开启合约监听
require('../core/listeners')
