import Router from 'koa-router'
import controllers from '../controllers'

const router = new Router()

router.get('/', async (ctx) => {
  ctx.body = 'home page'
})
router.get('/creatAccount', controllers.creatAccount)
router.get('/listAccounts', controllers.listAccounts)
router.get('/getBalance', controllers.getBalance)

module.exports = router
