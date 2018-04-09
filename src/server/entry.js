require('babel-register')({
  presets: ['es2015', 'stage-0'],
})

let server = require('./app').default
const env = require('../config/env')

let port = process.env.PORT || env.port

server.listen(port)

server.on('error', (error) => {
  if (error.syscall !== 'listen') {
    throw error
  }

  let bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`

  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} requires elevated privileges`)
      process.exit(1)
      break
    case 'EADDRINUSE':
      console.error(`${bind} is already in use`)
      process.exit(1)
      break
    default:
      throw error
  }
})

server.on('listening', () => {
  let addr = server.address()
  let bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`
  console.info(`Listening on ${bind}`)
})
