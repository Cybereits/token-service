import Router from 'koa-router'
import { create, list } from './actions/account'
import { queryEthBalance, queryOfficialTokenBalance, queryTokenBalance } from './actions/balance'

const router = new Router()

// 钱包相关
router.post('/account/create', create)
router.get('/account/list', list)

// 余额相关
router.get('/balance/queryEth', queryEthBalance)
router.get('/balance/queryToken', queryTokenBalance)
router.get('/balance/queryOfficialToken', queryOfficialTokenBalance)

module.exports = router
