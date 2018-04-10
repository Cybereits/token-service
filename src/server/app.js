import Koa from 'koa'
import cors from 'koa2-cors'

import router from './routes'

const app = new Koa()

app.use(cors({
  origin: '*',
  credentials: true,
}))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// routes
app.use(router.routes(), router.allowedMethods())

export default app
