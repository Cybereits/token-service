import Router from 'koa-router'
import bodyparser from 'koa-bodyparser'
import { graphqlKoa, graphiqlKoa } from 'apollo-server-koa'

import GraphqlSchema from './graphql'

const router = new Router()

router.post('/graphql', async (ctx, next) => {
    await graphqlKoa({ schema: GraphqlSchema, context: ctx })(ctx, next)
})
router.get('/graphql', async (ctx, next) => {
    await graphqlKoa({ schema: GraphqlSchema, cacheControl: true, context: ctx })(ctx, next)
})
router.get('/data', async (ctx, next) => {
    await graphiqlKoa({ endpointURL: '/graphql', context: ctx})(ctx, next)
})

export default router
