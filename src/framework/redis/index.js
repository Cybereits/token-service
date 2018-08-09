import redis from 'redis'
import redisWrapper from 'redis-conn-wrapper'

import env from '../../config/env.json'

const { ip, port } = env.redis

let client = redis.createClient(port, ip, {
  password: env.redis.pwd,
  db: env.redis.database,
})
let wrapper = redisWrapper(redis, {
  host: ip,
  port,
  password: env.redis.pwd,
  db: env.redis.database,
})

client
  .on('ready', () => console.log('redis connected successfully.'))
  .on('reconnecting', () => console.log('redis reconnecting...'))
  .on('error', err => console.error(`redis connect error:${err}`))

export const longConnection = client
export const tempConnection = wrapper
