import { connect } from '../../framework/web3'
import { getTokenBalance } from '../../utils/token'
import { deployOwnerAddr } from '../../config/const'

export async function queryEthBalance(ctx) {
  let { address } = ctx.query
  let [user, code, msg] = [{ address, balance: null }, 200, '']

  user.balance = await connect.eth.getBalance(address).catch((error) => {
    code = -1
    msg = error.toString()
    return null
  })

  if (user.balance) {
    user.balance = connect.eth.extend.utils.fromWei(user.balance, 'ether')
  }

  ctx.body = {
    code,
    user,
    msg,
  }
}

export async function queryTokenBalance(ctx) {
  let { address } = ctx.query
  let [user, code, msg] = [{ address: address, balance: null }, 200, '']

  user.balance = await getTokenBalance(address).catch((error) => {
    code = -1
    msg = error.toString()
    return null
  })

  ctx.body = {
    code,
    user,
    msg,
  }
}

export async function queryOfficialTokenBalance(ctx) {
  let [user, code, msg] = [{ address: deployOwnerAddr, balance: null }, 200, '']

  user.balance = await getTokenBalance(deployOwnerAddr).catch((error) => {
    code = -1
    msg = error.toString()
    return null
  })

  ctx.body = {
    code,
    user,
    msg,
  }
}
