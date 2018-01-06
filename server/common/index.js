require('babel-register')({
  presets: ['es2015', 'stage-0'],
})

const FILE_NAME_IN_CURRENT_DIR = process.env.task
require(`./${FILE_NAME_IN_CURRENT_DIR}`)