import {
  GraphQLString as str,
  GraphQLInt as int,
} from 'graphql'

import {
  adminInfo,
  adminLogoutType,
} from '../types/plainTypes'

import { AdminModel } from '../../core/schemas'

async function register(username, password, validPassword, role) {
  if (password !== validPassword) {
    return new Error('password not valid')
  }
  let res = {}

  let admin = await AdminModel.findOne({ username })
  if (admin) {
    throw new Error('username is already registered')
  } else {
    admin = new AdminModel({ username, password, role })
    return admin.save()
      .then((newAdmin) => {
        res.username = newAdmin.username
        res.role = newAdmin.role
        res.message = 'registered successfully'
        return res
      })
  }
}

async function resetPwd(username, originPwd, newPwd, confirmPwd, ctx) {
  if (newPwd !== confirmPwd) {
    return new Error('password not valid')
  }
  let admin = await AdminModel.findOne({ username })
  if (!admin) {
    return new Error('无效的身份')
  } else {
    let isMatch = await admin.comparePassword(originPwd, admin.password)
    if (!isMatch) {
      throw new Error('username or password not match')
    } else {
      admin.password = newPwd
      return admin.save()
        .then(() => {
          let res = {}

          ctx.session.admin = {
            username: admin.username,
            role: admin.role,
          }

          res.username = admin.username
          res.role = admin.role
          res.message = 'logined successfully'
          return res
        })
    }
  }
}

async function login(username, password, ctx) {
  if (ctx.session.admin) {
    return new Error('Already logged in')
  }

  let res = {}
  let admin = await AdminModel.findOne({ username })
  if (!admin) {
    return new Error('user not exist')
  } else {
    return admin
      .comparePassword(password, admin.password)
      .then((isMath) => {
        if (!isMath) {
          throw new Error('username or password not match')
        } else {
          ctx.session.admin = {
            username: admin.username,
            role: admin.role,
          }

          res.username = admin.username
          res.role = admin.role
          res.message = 'logined successfully'
          return res
        }
      })
  }
}

async function logout(ctx) {
  if (!ctx.session.admin) {
    return new Error('Not logged in')
  }
  ctx.session = null
  return { result: true }
}

export const adminRegister = {
  type: adminInfo,
  args: {
    username: { type: str },
    password: { type: str },
    validPassword: { type: str },
    role: { type: int },
  },
  resolve(root, { username, password, validPassword, role }, ctx) {
    let { session } = ctx
    if (!session || !session.admin || session.admin.role !== 1) {
      throw new Error('您没有权限创建用户，请联系超级管理员')
    } else {
      return register(username, password, validPassword, role)
    }
  },
}

export const adminLogin = {
  type: adminInfo,
  args: {
    username: { type: str },
    password: { type: str },
  },
  resolve(root, { username, password }, ctx) {
    return login(username, password, ctx)
  },
}

export const adminLogout = {
  type: adminLogoutType,
  resolve(root, _, ctx) {
    return logout(ctx)
  },
}

export const changePwd = {
  type: adminInfo,
  args: {
    originPassword: {
      type: str,
      description: '原始密码',
    },
    newPassword: {
      type: str,
      description: '新密码',
    },
    validPassword: {
      type: str,
      description: '确认密码',
    },
  },
  resolve(root, { originPassword, newPassword, validPassword }, ctx) {
    let { session } = ctx
    if (!session || !session.admin) {
      return new Error('您还没有登录')
    } else {
      return resetPwd(session.admin.username, originPassword, newPassword, validPassword, ctx)
    }
  },
}
