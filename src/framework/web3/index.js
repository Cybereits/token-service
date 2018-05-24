// web3 need ^1.0.0-beta.24
import Web3 from 'web3'
import { ws } from '../../config/env.json'

let initEthConnect = (wsUri, name) => {
  let conn = new Web3(new Web3.providers.WebsocketProvider(wsUri))
  setInterval(() => {
    conn
      .eth
      .getBlockNumber()
      .catch(() => {
        console.warn(`${name || '默认'}钱包客户端链接失败，尝试重新链接`)
        conn = new Web3(new Web3.providers.WebsocketProvider(wsUri))
      })
  }, 2000)
  return conn
}

const ethWalletConnect = initEthConnect(ws.eth)
const creWalletConnect = initEthConnect(ws.cre)

export {
  ethWalletConnect,
  creWalletConnect,
}
