const path = require('path')

let env = process.env.NODE_ENV || 'development'

const CONFIG = {
    production: {
        port: 3100,
        host: '',
        apiServer: 'https://api.cybereits.com/api',
    },
    alpha: {
        port: 3100,
        host: '',
        apiServer: 'https://api.cybereits.com/api',
    },
    test: {
        port: 3100,
        host: '',
        apiServer: 'https://api.cybereits.com/api',
    },
    development: {
        port: 3100,
        host: 'http://localhost:3100',
        apiServer: 'https://api.cybereits.com/api',
    },
}

let config = Object.assign({}, CONFIG[env], {
    env,
    path_base: path.resolve(__dirname, '..'),
    dir_client: 'client',
    dir_dist: 'public/dist',
})

module.exports = config
