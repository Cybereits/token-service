const path = require('path')

let env = process.env.NODE_ENV || 'development'

const CONFIG = {
    production: {
        port: 3100,
        host: '',
        apiServer: 'https://api.cybereits.com/api/walet',
    },
    alpha: {
        port: 3100,
        host: '',
        apiServer: 'https://api.cybereits.com/api/walet',
    },
    test: {
        port: 3100,
        host: '',
        apiServer: 'https://api.cybereits.com/api/walet',
    },
    development: {
        port: 3100,
        host: 'http://localhost:3100',
        apiServer: 'https://api.cybereits.com/api/walet',
    },
}

let config = Object.assign({}, CONFIG[env], {
    env,
    path_base: path.resolve(__dirname, '..'),
    dir_client: 'client',
    dir_dist: 'public/dist',
})

module.exports = config
