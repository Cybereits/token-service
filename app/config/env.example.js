const env = process.env.NODE_ENV || 'development'

const CONFIG = {
  production: {
    host: 'http://localhost',
    port: 8082,
    baseUrl: '/graphql',
  },
  development: {
    host: 'http://localhost',
    port: 8010,
    baseUrl: '/graphql',
  },
}

console.log(`Environment : ${env}`)

export default Object.assign({}, CONFIG[env], { env })
