require('babel-register')({
  presets: ['es2015', 'stage-0'],
})

let FILE_NAME_IN_CURRENT_DIR = process.argv[2]
let func = require(`./${FILE_NAME_IN_CURRENT_DIR}`).default
func.apply(global, process.argv.slice(3))
