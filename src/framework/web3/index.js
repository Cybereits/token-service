// web3 need ^1.0.0-beta.24
import Web3 from 'web3'
import { ws } from '../../config/env.json'

let _index = 0
let _pool = {}

function initEthConnect(wsUri, name) {
  let connected = true
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
  }, 3000)

  _pool[name] = conn
  return conn
}

/**
 * 对于某些不需要指定钱包客户端的操作，比如合约、账户查询等，推荐使用轮询的方式获取客户端链接对象，以保证钱包客户端的负载较为均衡
 * @returns {Object} web3 client
 */
function getConnection() {
  // console.info(`当前有效客户端链接 ${Object.keys(_pool).length}`)
  let keys = Object.keys(_pool)
  let length = keys.length
  if (length > 0) {
    return _pool[keys[_index++ % length]]
  } else {
    return new Web3(new Web3.providers.WebsocketProvider(ws.cre))
  }
}

export const ethClientConnection = initEthConnect(ws.eth, 'Ethereum')
export const creClientConnection = initEthConnect(ws.cre, 'Cybereits')
export default getConnection
