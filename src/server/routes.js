import Router from 'koa-router'
import { graphqlKoa, graphiqlKoa } from 'apollo-server-koa'

import { authSchema, publicSchema } from './graphql'

export const publicRouter = new Router()
export const authRouter = new Router()

authRouter.post('/graphql', async (ctx, next) => {
  await graphqlKoa({ schema: authSchema, context: ctx })(ctx, next)
})

authRouter.get('/data', async (ctx, next) => {
  await graphiqlKoa({ endpointURL: '/graphql', context: ctx })(ctx, next)
})

publicRouter.post('/public', async (ctx, next) => {
  await graphqlKoa({ schema: publicSchema, context: ctx })(ctx, next)
})

publicRouter.get('/login', async (ctx, next) => {
  await graphiqlKoa({ endpointURL: '/public', context: ctx })(ctx, next)
})
