let env = process.env.NODE_ENV || 'development'

const CONFIG = {
  production: {
    port: 8010,
  },
  development: {
    port: 8010,
  },
}

console.log(`Environment : ${env}`)

module.exports = Object.assign({}, CONFIG[env], { env })
