import {
  GraphQLString as str,
  GraphQLInt as int,
} from 'graphql'

import {
  adminRegisterType,
  amdinLoginType,
  adminLogoutType,
} from '../types/plainTypes'

import { AdminModel } from '../../core/schemas'

async function register(username, password, validPassword, role) {

  if (password !== validPassword) {
    throw Error('password not valid')
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
  type: adminRegisterType,
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
  type: amdinLoginType,
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
