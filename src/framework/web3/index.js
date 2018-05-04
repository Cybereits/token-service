// web3 need ^1.0.0-beta.24
import Web3 from 'web3'
import { clientPort } from '../../config/env'

// eslint-disable-next-line
export let connect = new Web3(new Web3.providers.WebsocketProvider(`ws://127.0.0.1:${clientPort || 8546}`))

setInterval(() => {
  connect.eth.getBlockNumber().catch(() => {
    console.warn('geth 钱包客户端链接失败，尝试重新链接')
    connect = new Web3(new Web3.providers.WebsocketProvider(`ws://127.0.0.1:${clientPort || 8546}`))
  })
}, 2000)

