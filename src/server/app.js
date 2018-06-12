import Koa from 'koa'
import cors from 'koa2-cors'
import session from 'koa-session'
import serve from 'koa-static'
import bodyParser from 'koa-bodyparser'

import router from './routes'
import env from '../config/env.json'
import { sessionValid } from './middlewares/valid'

const port = env.port

const app = new Koa()

app.use(cors({
  origin: 'http://localhost:8000',
  credentials: true,
}))

app.keys = ['some keys blah blah']

const CONFIG = {
  key: 'sess', /** (string) cookie key (default is koa:sess) */
  maxAge: 24 * 60 * 60 * 1000, /** 24 小时过期时间 */
  overwrite: true, /** (boolean) can overwrite or not (default true) */
  httpOnly: false, /** (boolean) httpOnly or not (default true) */
  signed: true, /** (boolean) signed or not (default true) */
  rolling: false, /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */
  renew: false, /** (boolean) renew session when session is nearly expired, so we can always keep user logged in. (default is false)*/
}

app.use(bodyParser({ enableTypes: ['json', 'form', 'text'] }))
app.use(session(CONFIG, app))
app.use(serve(`${__dirname}/../../app/dist`))
app.use(sessionValid)
app.use(router.routes(), router.allowedMethods())

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
