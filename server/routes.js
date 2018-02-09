import Router from 'koa-router'
import controllers from './controllers'

const router = new Router()

router.get('/creatAccount', controllers.creatAccount)
router.get('/listAccounts', controllers.listAccounts)
router.get('/getBalance', controllers.getBalance)
router.get('/queryTokenBalance', controllers.queryTokenBalance)
router.get('/officialBalance', controllers.queryOfficialTokenBalance)

module.exports = router
