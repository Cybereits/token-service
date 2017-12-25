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
        apiServer: 'https://sess.kakamf.com',
    },
    test: {
        port: 3100,
        host: '',
        apiServer: 'https://testservice.kakamf.com',
    },
    development: {
        port: 3100,
        host: 'http://localhost:3100',
        apiServer: 'https://testservice.kakamf.com',
    },
}

let config = Object.assign({}, CONFIG[env], {
    env,
    path_base: path.resolve(__dirname, '..'),
    dir_client: 'client',
    dir_dist: 'public/dist',
})

module.exports = config
