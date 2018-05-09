let env = process.env.NODE_ENV || 'development'

if (env === 'production') {
  module.exports = {
    apiServer: 'https://api.cybereits.com/api',
    port: 8092,
    schedule: ['wallet', 'tx'],
    env,
    ws: {
      eth: 'ws://127.0.0.1:8546',
      cre: 'ws://127.0.0.1:8546',
    },
  }
} else {
  module.exports = {
    apiServer: '',
    port: 8010,
    schedule: ['tx'],
    env,
    ws: {
      eth: 'ws://127.0.0.1:8546',
      cre: 'ws://127.0.0.1:8546',
    },
  }
}
