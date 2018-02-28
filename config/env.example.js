let env = process.env.NODE_ENV || 'development'

const CONFIG = {
  production: {
    port: 3100,
    apiServer: '',
  },
  development: {
    port: 3100,
    apiServer: 'http://localhost:8081/api',
  },
}

console.log(`Environment : ${env}`)

module.exports = Object.assign({}, CONFIG[env], { env })
