let env = process.env.NODE_ENV || 'development'

const CONFIG = {
  production: {
    apiServer: '',
    port: 8010,
    clientPort: 8545,
  },
  development: {
    apiServer: '',
    port: 8010,
    clientPort: 8545,
  },
}

console.log(`Environment : ${env}`)

module.exports = Object.assign({}, CONFIG[env], { env })
