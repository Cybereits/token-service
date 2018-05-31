// web3 need ^1.0.0-beta.24
import Web3 from 'web3'
import { ws } from '../../config/env.json'

let _index = 0
let _pool = []

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
          _pool.push(conn)
          console.info(`当前有效客户端链接 ${_pool.length}`)
        }
      })
      .catch(() => {
        if (connected) {
          connected = false
        }
        console.warn(`[${name || '默认'}] 钱包客户端连接失败，尝试重连...`)
        _pool = _pool.filter(conn => conn.__name !== name)
        console.info(`当前有效客户端链接 ${_pool.length}`)
        conn = new Web3(new Web3.providers.WebsocketProvider(wsUri))
      })
  }, 3000)

  conn.__name = name
  return conn
}

// 对于某些不需要指定钱包客户端的操作，比如合约、账户查询等
// 我们推荐使用轮询的方式获取客户端链接对象
// 以保证负载较为均衡
function getConnection() {
  if (_pool.length > 0) {
    return _pool[_index++ % _pool.length]
  } else {
    throw new Error('没有可用的钱包客户端链接.')
  }
}

export const ethClientConnection = initEthConnect(ws.eth, 'Ethereum')
export const creClientConnection = initEthConnect(ws.cre, 'Cybereits')
export default getConnection
