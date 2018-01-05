const path = require('path')

let env = process.env.NODE_ENV || 'development'

module.exports = {
    production: {
        port: 3100,
        host: '',
        apiServer: 'https://api.cybereits.com/api',
    },
    development: {
        port: 3100,
        host: 'http://localhost:3100',
        apiServer: 'https://api.id-cloud.org/api',
    },
    env,
}
