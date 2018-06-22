import {
  GraphQLString as str,
  GraphQLNonNull as NotNull,
  GraphQLInt as int,
} from 'graphql'

import {
  adminInfo,
  adminLogoutType,
} from '../types/plainTypes'

import { PaginationWrapper, PaginationResult } from '../types/complexTypes'

import { AdminModel } from '../../core/schemas'

async function register(username, password, validPassword, role) {
  if (password !== validPassword) {
    return new Error('两次输入的密码不一致')
  }
  let res = {}

  let admin = await AdminModel.findOne({ username })
  if (admin) {
    throw new Error('用户名已存在')
  } else {
    admin = new AdminModel({ username, password, role })
    return admin.save()
      .then((newAdmin) => {
        res.username = newAdmin.username
        res.role = newAdmin.role
        return res
      })
  }
}

async function resetPwd(username, originPwd, newPwd, confirmPwd, ctx) {
  if (newPwd !== confirmPwd) {
    return new Error('两次输入的密码不一致')
  }
  let admin = await AdminModel.findOne({ username })
  if (!admin) {
    return new Error('无效的身份')
  } else {
    let isMatch = await admin.comparePassword(originPwd, admin.password)
    if (!isMatch) {
      throw new Error('用户名或者密码不匹配')
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
          return res
        })
    }
  }
}

async function login(username, password, ctx) {
  if (ctx.session && ctx.session.admin) {
    let { username, role } = ctx.session.admin
    return {
      username,
      role,
    }
  }

  let res = {}
  let admin = await AdminModel.findOne({ username })
  if (!admin) {
    return new Error('用户不存在')
  } else {
    return admin
      .comparePassword(password, admin.password)
      .then((isMath) => {
        if (!isMath) {
          throw new Error('用户名或者密码不匹配')
        } else {
          ctx.session.admin = {
            username: admin.username,
            role: admin.role,
          }

          res.username = admin.username
          res.role = admin.role
          return res
        }
      })
  }
}

async function logout(ctx) {
  ctx.session = null
  return { result: true }
}

export const createAdmin = {
  type: adminInfo,
  description: '创建管理员',
  args: {
    username: {
      type: new NotNull(str),
    },
    password: {
      type: new NotNull(str),
    },
    validPassword: {
      type: new NotNull(str),
    },
  },
  resolve(root, { username, password, validPassword }, ctx) {
    let { session } = ctx
    if (!session || !session.admin || session.admin.role !== 1) {
      throw new Error('您没有权限创建用户，请联系超级管理员')
    } else {
      return register(username, password, validPassword, 2)
    }
  },
}

export const adminLogin = {
  type: adminInfo,
  description: '管理员登录',
  args: {
    username: {
      type: new NotNull(str),
      description: '用户名',
    },
    password: {
      type: new NotNull(str),
      description: '用户登录密码',
    },
  },
  resolve(root, { username, password }, ctx) {
    return login(username, password, ctx)
  },
}

export const adminLogout = {
  type: adminLogoutType,
  description: '管理员注销',
  resolve(root, _, ctx) {
    return logout(ctx)
  },
}

export const changePwd = {
  type: adminInfo,
  description: '更改密码',
  args: {
    originPassword: {
      type: new NotNull(str),
      description: '原始密码',
    },
    newPassword: {
      type: new NotNull(str),
      description: '新密码',
    },
    validPassword: {
      type: new NotNull(str),
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

export const queryAdminList = {
  type: PaginationWrapper(adminInfo),
  description: '管理员列表',
  args: {
    pageIndex: {
      type: int,
      description: '页码',
    },
    pageSize: {
      type: int,
      description: '页容',
    },
  },
  async resolve(root, { pageIndex = 0, pageSize = 10 }) {
    let total = await AdminModel.count()
    let list = await AdminModel.find().skip(pageSize * pageIndex).limit(pageSize)
    return PaginationResult(list, pageIndex, pageSize, total)
  },
}
