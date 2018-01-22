let env = process.env.NODE_ENV || 'development'

const CONFIG = {
    production: {
        port: 3100,
        apiServer: 'https://api.cybereits.com/api',
    },
    development: {
        port: 3100,
        apiServer: 'http://192.168.3.11:8000/api',
    },
}

console.log(`Environment : ${env}`)

module.exports = Object.assign({}, CONFIG[env], { env })
