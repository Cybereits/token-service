import {
  GraphQLString as str,
  GraphQLNonNull as NotNull,
} from 'graphql'

import { userInfo } from '../types/plainTypes'
import { userModel } from '../../core/schemas'
import encrypter from '../../framework/encrypt'

export const userLogin = {
  type: userInfo,
  description: '查询账户下的代币余额',
  args: {
    username: {
      type: new NotNull(str),
      description: '用户名',
    },
    password: {
      type: new NotNull(str),
      description: '密码',
    },
  },
  async resolve(root, { username, password }) {
    let matchedUser = userModel.findOne({ username, enabled: true })
    if (matchedUser) {
      let hash = await encrypter.encrypt(password, username)
      if (matchedUser.password === hash) {
        // success
      } else {
        throw new Error('密码错误！')
      }
    } else {
      throw new Error('未找到对应用户信息')
    }
  },
}
