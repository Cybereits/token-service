import mongoose from 'mongoose'

import { mongo } from '../../config/env.json'

mongoose.Promise = Promise
const { ip, name, port } = mongo

const db = mongoose
  .createConnection(ip, name, port)
  // 成功链接数据库
  .once('open', () => console.log('mongodb has open!'))
  // 链接数据库失败
  .on('error', err => console.error(`mongodb connect error ${err}`))

export default db
