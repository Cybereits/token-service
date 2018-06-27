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

let FILE_NAME_IN_CURRENT_DIR = process.argv[2]

console.log(`执行参数 - ${process.argv.slice(2)}`)

let func = require(`${__dirname}/${FILE_NAME_IN_CURRENT_DIR}`).default

func.apply(global, process.argv.slice(3))
