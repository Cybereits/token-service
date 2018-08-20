import mongoose from 'mongoose'
import bcrypt from 'bcrypt/bcrypt'

import { USER_ROLE_LEVELS} from '../enums'

import connection from '../../framework/dbProviders/mongo'

const SALT_WORK_FACTOR = 10

// admin
const adminUser = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  authSecret: String, // google 双向验证 secret
  mobile: String,  // 手机号
  role: { // 1:超级管理员，2:普通管理员
    type: Number,
    default: USER_ROLE_LEVELS.admin,
  },
})

adminUser.pre('save', function (next) {
  let admin = this

  if (!admin.isModified('password')) return next()

  bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
    if (err) return next(err)
    bcrypt.hash(admin.password, salt, (err, hash) => {
      if (err) return next(err)
      admin.password = hash
      next()
    })
  })
})

adminUser.methods = {
  comparePassword: function (_password, password) {
    return new Promise((resolve, reject) => {
      bcrypt.compare(_password, password, (err, isMath) => {
        if (err) reject(err)
        else resolve(isMath)
      })
    })
  },
}

export default connection.model('adminUser', adminUser)
