let env = process.env.NODE_ENV || 'development'

const CONFIG = {
  production: {
    port: 8010,
    apiServer: '',
    clientPort: 8545,
    schedule: ['cre', 'eth'],
  },
  development: {
    port: 8010,
    apiServer: '',
    clientPort: 8545,
    schedule: ['cre', 'eth'],
  },
}

console.log(`Environment : ${env}`)

module.exports = Object.assign({}, CONFIG[env], { env })
