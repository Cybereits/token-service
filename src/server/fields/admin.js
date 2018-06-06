import {
  GraphQLString as str,
  GraphQLObjectType,
  GraphQLBoolean,
  GraphQLInt,
} from 'graphql'

import { AdminModel } from '../../core/schemas'

async function register(username, password, validPassword, role) {

  if (password !== validPassword) {
    return new Error('password not valid')
  }

  let res = {}
  const registerPromise = new Promise((resolve, reject) => {
    AdminModel.findOne({ username }, (err, admin) => {
      if (err) reject(err)
      if (admin) reject(new Error('username is already registered'))

      admin = new AdminModel({ username, password, role })

      admin.save()
        .then((data) => {
          resolve(data)
        })
        .catch((err) => {
          reject(err)
        })
    })
  })
  await registerPromise
    .then((user) => {
      res.username = user.username
      res.message = 'registered successfully'
      res.role = user.role
    })
    .catch((err) => {
      if (err) {
        res = err
      }
    })
  return res
}

async function login(username, password, ctx) {
  if (ctx.session.admin) {
    throw new Error('Already logged in')
  }

  let res = {}
  let admin = await AdminModel.findOne({ username })
  if (!admin) {
    throw new Error('user not exist')
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
  if (!ctx.session.admin) return new Error('Not logged in')
  let res = { result: true }
  ctx.session = null
  return res
}

export const adminRegister = {
  description: '添加管理员账户',
  type: new GraphQLObjectType({
    name: 'adminRegister',
    fields: {
      _id: { type: str },
      username: { type: str },
      role: { type: GraphQLInt },
      message: { type: str },
    },
  }),
  args: {
    username: { type: str },
    password: { type: str },
    validPassword: { type: str },
    role: { type: GraphQLInt },
  },
  resolve(root, { username, password, validPassword, role }, options) {
    return register(username, password, validPassword, role)
  },
}

export const adminLogin = {
  description: '管理员登陆',
  type: new GraphQLObjectType({
    name: 'adminLogin',
    fields: {
      username: { type: str },
      message: { type: str },
      role: { type: GraphQLInt },
    },
  }),
  args: {
    username: { type: str },
    password: { type: str },
  },
  resolve(root, { username, password }, ctx) {
    return login(username, password, ctx)
  },
}

export const adminLogout = {
  description: '管理员登出',
  type: new GraphQLObjectType({
    name: 'loginout',
    fields: {
      result: { type: GraphQLBoolean },
    },
  }),
  resolve(root, _, ctx) {
    return logout(ctx)
  },
}
