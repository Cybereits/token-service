import web3 from '../../framework/web3'
import tokenContractData from '../contracts/token'

const tokenContractAbi = JSON.parse(tokenContractData.abi[0])
const tokenContractAddress = tokenContractData.address[0]


async function getTokenContract(connect) {
  let _connect = connect
  if (!_connect) {
    _connect = await web3.onWs
  }
  let tokenContract = new _connect.eth.Contract(tokenContractAbi, tokenContractAddress)
  return tokenContract
}

export async function getTotal(contract = null) {
  let _contract = contract
  if (!_contract) {
    _contract = await getTokenContract()
  }
  return _contract.methods.totalSupply().call(null)
}

export async function balanceOf(contract = null, userAddress) {
  let _contract = contract
  if (!_contract) {
    _contract = await getTokenContract()
  }
  return _contract.methods.balanceOf(userAddress).call(null)
}

export async function getTokenBalance(userAddress) {
  let connect = await web3.onWs
  let tokenContract = await getTokenContract(connect)
  let tokenTotalAmount = await getTotal(tokenContract)
  let userBalance = await balanceOf(tokenContract, userAddress)
  console.log(`token contract:${tokenContract}`)
  return {
    tokenContractAddress,
    total: connect.utils.fromWei(tokenTotalAmount, 'nano'),
    userAddress,
    balance: connect.utils.fromWei(userBalance, 'nano'),
    proportion: +(+((userBalance / tokenTotalAmount) * 100).toFixed(2)),
  }
}