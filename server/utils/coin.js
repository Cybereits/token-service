import tokenContractData from '../contracts/token.json'

import web3 from '../../framework/web3'
import { lockAccount, unlockAccount } from './basic'
import {
  gas,
  gasPrice,
  contractDecimals,
} from '../../config/const'

// don't ask me why, it just happened!!!
const lockContractAbi = JSON.parse(tokenContractData.abi[0])
const tokenContractAbi = JSON.parse(tokenContractData.abi[1])
const tokenContractAddress = tokenContractData.address[0]

export async function getTokenContract(connect) {
  return new connect.eth.Contract(tokenContractAbi, tokenContractAddress)
}

export async function getLockContract(connect, address) {
  return new connect.eth.Contract(lockContractAbi, address)
}

export async function getTotal(connect, contract = null) {
  let amount = await contract.methods.totalSupply().call(null)
  return connect.eth.extend.utils.fromWei(amount, 'ether')
}

export async function balanceOf(connect, contract = null, userAddress) {
  let amount = await contract.methods.balanceOf(userAddress).call(null)
  return connect.eth.extend.utils.fromWei(amount, 'ether')
}

export async function getTokenBalance(userAddress) {
  let connect = await web3.onWs
  let tokenContract = await getTokenContract(connect)
  let tokenTotalAmount = await getTotal(connect, tokenContract)
  let userBalance = await balanceOf(connect, tokenContract, userAddress)
  return {
    tokenContractAddress,
    total: tokenTotalAmount,
    userAddress,
    balance: userBalance,
    proportion: +(+((userBalance / tokenTotalAmount) * 100).toFixed(2)),
  }
}

export async function sendToken(fromAddress, passWord, toAddress, amount) {
  if (amount > 10000000) {
    return {
      msg: '单笔转账不得超过一千万代币',
    }
  } else if (amount <= 0) {
    return {
      msg: '忽略转账额度小于等于0的请求',
    }
  } else {
    let connect = await web3.onWs
    let tokenContract = await getTokenContract(connect)
    // 对于超过20位的数值会转换成科学计数法 所以这里换成字符串拼接的方式
    let _amountDecimals = `${amount}${'0'.repeat(contractDecimals)}`
    console.log(_amountDecimals)
    await unlockAccount(connect, fromAddress, passWord)
    let sendToken = await tokenContract.methods.transfer(toAddress, _amountDecimals).send({
      from: fromAddress,
      gas,
      gasPrice,
    })

    lockAccount(connect, fromAddress)
    return {
      result: sendToken.events.Transfer,
      msg: `send finished, from ${fromAddress} to ${toAddress} amount ${_amountDecimals}`,
    }
  }
}
