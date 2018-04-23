import Router from 'koa-router'
import bodyparser from 'koa-bodyparser'
import { graphqlKoa, graphiqlKoa } from 'apollo-server-koa'
import GraphqlSchema from './graphql'
import { create, list } from './actions/account'

const router = new Router()

router.post('/graphql', bodyparser({ enableTypes: ['json', 'form', 'text'] }), graphqlKoa({ schema: GraphqlSchema }))
router.get('/graphql', graphqlKoa({ schema: GraphqlSchema, cacheControl: true }))
router.get('/data', graphiqlKoa({ endpointURL: '/graphql' }))

// 钱包相关
router.post('/account/create', create)
router.get('/account/list', list)

export default router
