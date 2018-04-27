const { NODE_ENV } = process.env

let config = {}

/**
 * 根据不同的环境，生成不同的配置
 */
switch (NODE_ENV) {
  case 'production':
    config = [
      {
        name: 'token-service',
        script: './server/entry.js',
        instances: 1,
        cwd: './', // app lunched path
        error_file: 'logs/err.log',
        out_file: 'logs/out.log',
        merge_logs: true,
        log_date_format: 'YYYY-MM-DD HH:mm:ss',
        env: {
          NODE_ENV,
        },
      },
      {
        name: 'schedule-task',
        script: './server/entry:schedule.js',
        instances: 1,
        cwd: './',
        error_file: 'logs/schedule-err.log',
        out_file: 'logs/schedule-out.log',
        merge_logs: true,
        env: {
          NODE_ENV,
        },
      },
    ]
    break
  case 'development':
  default:
    config = [
      {
        name: 'token-service',
        script: './server/entry.js',
        instances: 1,
        cwd: './', // app lunched path
        error_file: 'logs/err.log',
        out_file: 'logs/out.log',
        merge_logs: true,
        log_date_format: 'YYYY-MM-DD HH:mm:ss',
        watch: [
          'server',
          'tasks',
          'utils',
          'config',
          'bin',
          'core',
          'framework',
        ],
        ignore_watch: [
          'node_modules',
          'geth-node',
        ],
        env: {
          NODE_ENV,
        },
      },
      {
        name: 'schedule-task',
        script: './server/entry:schedule.js',
        instances: 1,
        cwd: './',
        error_file: 'logs/schedule-err.log',
        out_file: 'logs/schedule-out.log',
        merge_logs: true,
        watch: [
          'server/jobs',
          'config',
        ],
        ignore_watch: [
          'node_modules',
          'geth-node',
        ],
        env: {
          NODE_ENV,
        },
      },
    ]
    break
}

module.exports = config
