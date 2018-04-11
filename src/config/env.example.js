let env = process.env.NODE_ENV || 'development'

const CONFIG = {
  production: {
    port: 8010,
    apiServer: '',
  },
  development: {
    port: 8010,
    apiServer: 'http://localhost:8081/data',
  },
}

console.log(`Environment : ${env}`)

module.exports = Object.assign({}, CONFIG[env], { env })
