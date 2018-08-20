// web3 need ^1.0.0-beta.24
import Web3 from 'web3'
import { clients } from '../../config/env.json'

const reconnectDelay = 2

function establishConnection(uri) {
  let conn = new Web3(new Web3.providers.WebsocketProvider(uri))
  let onclose = () => {
    console.warn(`[${uri}] 钱包客户端连接失败，${reconnectDelay} 秒后尝试重连...`)
    setTimeout(() => {
      conn = establishConnection(uri)
    }, reconnectDelay * 1000)
  }

  let onconnect = () => {
    console.info(`[${uri}] 钱包客户端连接成功!`)
  }

  conn.__uri = uri

  conn.currentProvider.on('end', onclose)
  conn.currentProvider.on('connect', onconnect)

  return conn
}

function initEthConnect(wsUri) {
  let conn = establishConnection(wsUri)
  return () => conn
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
    let _matched_index = _pool.findIndex(c => c().__uri === uri)
    // 查找当前链接池中是否有对应的钱包链接
    if (_matched_index > -1) {
      // 如果有则返回对应链接
      console.log(`使用链接池中的链接 [${uri}]`)
      return _pool[_matched_index]()
    } else {
      // 如果没有 则新建链接
      console.log(`新建临时链接 [${uri}]`)
      let conn = new Web3(new Web3.providers.WebsocketProvider(uri))
      conn.__uri = uri
      return conn
    }
  } else {
    let len = _pool.length
    if (len > 0) {
      _index = (_index + 1) % len
      return _pool[_index]()
    } else {
      throw new Error('没有可用的钱包链接...')
    }
  }
}

export default getConnection
