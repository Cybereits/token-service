import Koa from 'koa'
import cors from 'koa2-cors'
import session from 'koa-session'
import serve from 'koa-static'

import router from './routes'
import env from '../config/env.json'
import { sessionValid } from './middlewares/valid'
import logger from './middlewares/logger'

const port = env.port

const app = new Koa()

app.use(cors({
  origin: '*',
  credentials: true,
}))

app.keys = ['some keys blah blah']

const CONFIG = {
  key: 'sess', /** (string) cookie key (default is koa:sess) */
  maxAge: 3600000, /** 1 小时过期时间 */
  overwrite: true, /** (boolean) can overwrite or not (default true) */
  httpOnly: false, /** (boolean) httpOnly or not (default true) */
  signed: true, /** (boolean) signed or not (default true) */
  rolling: false, /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */
  renew: false, /** (boolean) renew session when session is nearly expired, so we can always keep user logged in. (default is false)*/
}

app.use(session(CONFIG, app))
app.use(logger)
if (process.env.NODE_ENV === 'production') {
  app.use(sessionValid)
}

// routes
app.use(router.routes(), router.allowedMethods())
app.use(serve(`${__dirname}/../../app/dist`))

app.on('error', (error) => {
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

app.listen(port, () => {
  console.info(`Listening on ${port}`)
})
