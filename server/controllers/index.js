import web3 from '../../framework/web3'
import request from '../../framework/request'
import config from '../../config/env'

function _buildUrl(subpath) {
  return subpath ? `${config.apiServer}/${subpath}` : config.apiServer
}

async function creatAccount(ctx) {
  let connect = await web3.onWs
  let newAccount = await connect.eth.personal.newAccount()
  ctx.body = {
    newAccount,
  }
}

async function listAccounts(ctx) {
  let connect = await web3.onWs
  let listAccounts = await connect.eth.getAccounts()
  
  ctx.body = {
    listAccounts,
  }
}

export default {
  creatAccount,
  listAccounts,
}
