import web3 from '../framework/web3'

async function getBalance() {
  let connect = await web3.onWs
  let listAccounts = await connect.eth.getAccounts()
  listAccounts.forEach(async (address) => {
    await connect.eth.getBalance(address)
      .then((amount) => {
        console.log(`钱包地址 ${address} eth 余额 ${connect.eth.extend.utils.fromWei(amount, 'ether')}`)
      })
      .catch((ex) => {
        console.error(`get address eth balance failded: ${address}`)
        process.exit(-1)
      })
  })
}

export default getBalance
