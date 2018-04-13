const env = process.env.NODE_ENV || 'development'

const CONFIG = {
  production: {
    host: 'localhost',
    port: 8086,
    baseUrl: '/graphql',
  },
  development: {
    host: 'http://192.168.3.200',
    port: 8010,
    baseUrl: '/graphql',
  },
}

console.log(`Environment : ${env}`)

module.exports = Object.assign({}, CONFIG[env], { env })
