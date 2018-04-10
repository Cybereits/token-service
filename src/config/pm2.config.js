const { NODE_ENV } = process.env

const config = {
  'name': 'token-service',
  'script': './server/entry.js',
  'instances': 1,
  'cwd': './', // app lunched path
  'env': {
    NODE_ENV,
  },
}

let mergeConfig = {}

/**
 * 根据不同的环境，生成不同的配置
 */
switch (NODE_ENV) {
  case 'production':
    mergeConfig = {
      'error_file': 'logs/err.log',
      'out_file': 'logs/out.log',
      'merge_logs': true,
      'log_date_format': 'YYYY-MM-DD HH:mm:ss',
    }
    break
  case 'development':
  default:
    mergeConfig = {
      'watch': [
        'server',
        'tasks',
        'utils',
        'config',
        'bin',
        'core',
        'framework',
      ],
      'ignore_watch': [
        'node_modules',
        'geth-node',
      ],
    }
    break
}

let exportConfig = Object.assign({}, config, mergeConfig)

module.exports = exportConfig
