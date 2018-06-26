// web3 need ^1.0.0-beta.24
import Web3 from 'web3'
import { clients } from '../../config/env.json'

function initEthConnect(wsUri) {
  let connected = true
  let conn = new Web3(new Web3.providers.WebsocketProvider(wsUri))
  conn.__uri = wsUri

  // 心跳检测
  setInterval(() => {
    conn
      .eth
      .getBlockNumber()
      .then(() => {
        if (!connected) {
          connected = true
          console.info(`[${wsUri}] 钱包客户端连接成功!`)
        }
      })
      .catch(() => {
        if (connected) {
          connected = false
        }
        console.warn(`[${wsUri}] 钱包客户端连接失败，尝试重连...`)
        conn = new Web3(new Web3.providers.WebsocketProvider(wsUri))
        conn.__uri = wsUri
      })
  }, 3000)

  return conn
}

let _index = 0
let _pool = clients.map(initEthConnect)

/**
 * 获取钱包客户端链接
 * @param {string|null} 客户端套接字链接地址
 * @returns {object} 钱包客户端链接
 */
function getConnection(uri) {
  if (uri) {
    return new Web3(new Web3.providers.WebsocketProvider(uri))
  } else {
    let len = _pool.length
    if (len > 0) {
      _index = (_index + 1) % len
      return _pool[_index]
    } else {
      throw new Error('没有可用的钱包链接...')
    }
  }
}

export default getConnection
