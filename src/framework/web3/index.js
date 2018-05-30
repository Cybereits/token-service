// web3 need ^1.0.0-beta.24
import Web3 from 'web3'
import { ws } from '../../config/env.json'

let initEthConnect = (wsUri, name) => {
  let connected = false
  let conn = new Web3(new Web3.providers.WebsocketProvider(wsUri))

  // 心跳检测
  setInterval(() => {
    conn
      .eth
      .getBlockNumber()
      .then(() => {
        if (!connected) {
          connected = true
          console.info(`[${name || '默认'}] 钱包客户端连接成功!`)
        }
      })
      .catch(() => {
        if (connected) {
          connected = false
        }
        console.warn(`[${name || '默认'}] 钱包客户端连接失败，尝试重连...`)
        conn = new Web3(new Web3.providers.WebsocketProvider(wsUri))
      })
  }, 5000)

  return conn
}

const ethWalletConnect = initEthConnect(ws.eth, 'Ethereum')
const creWalletConnect = initEthConnect(ws.cre, 'Cybereits')

export {
  ethWalletConnect,
  creWalletConnect,
}
