import { connect } from '../../framework/web3'

export async function create(ctx) {
  let [newAccount, code, msg] = ['', 200, '']

  newAccount = await connect.eth.personal.newAccount().catch((error) => {
    code = -1
    msg = error.toString()
    return null
  })

  ctx.body = {
    code,
    newAccount,
    msg,
  }
}

export async function list(ctx) {
  let [listAccounts, code, msg] = [[], 200, '']

  listAccounts = await connect.eth.getAccounts().catch((error) => {
    code = -1
    msg = error.toString()
    return null
  })

  ctx.body = {
    code,
    listAccounts,
    msg,
  }
}
