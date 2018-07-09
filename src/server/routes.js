import Router from 'koa-router'
import { graphqlKoa, graphiqlKoa } from 'apollo-server-koa'

import { defaultSchema } from './graphql'

const router = new Router()

router.post('/graphql', async (ctx, next) => {
  await graphqlKoa({ schema: defaultSchema, context: ctx })(ctx, next)
})

router.get('/data', async (ctx, next) => {
  await graphiqlKoa({ endpointURL: '/graphql', context: ctx })(ctx, next)
})

export default router
