let env = process.env.NODE_ENV || 'development'

const CONFIG = {
    production: {
        port: 3100,
        apiServer: 'https://api.cybereits.com/api',
    },
    development: {
        port: 3100,
        apiServer: 'https://api.id-cloud.org/api',
    },
}

console.log(`Environment : ${env}`)

module.exports = Object.assign({}, CONFIG[env], { env })
