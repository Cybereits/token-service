import mongoose from 'mongoose'
import propReader from 'properties-reader'
import path from 'path'

mongoose.Promise = Promise

let reader = propReader(path.resolve(__dirname, '../../config/server.properties'))
let ip = reader.get('db_ip')
let name = reader.get('db_name')
let port = reader.get('db_port')

const db = mongoose
  .createConnection(ip, name, port)
  // 成功链接数据库
  .once('open', () => console.log('mongodb has open!'))
  // 链接数据库失败
  .on('error', err => console.error(`mongodb connect error ${err}`))

export default db
