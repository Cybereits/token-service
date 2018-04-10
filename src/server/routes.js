import Router from 'koa-router'
import bodyparser from 'koa-bodyparser'
import { graphqlKoa, graphiqlKoa } from 'apollo-server-koa'
import GraphqlSchema from './graphql'

const router = new Router()

// koaBody is needed just for POST.
router.post('/graphql', bodyparser({ enableTypes: ['json', 'form', 'text'] }), graphqlKoa({ schema: GraphqlSchema }))
router.get('/graphql', graphqlKoa({ schema: GraphqlSchema, cacheControl: true }))
router.get('/data', graphiqlKoa({ endpointURL: '/graphql' }))

export default router
