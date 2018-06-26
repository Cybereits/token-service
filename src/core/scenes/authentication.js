import speakeasy from 'speakeasy'
import { AdminModel } from '../schemas'

/**
 * 获取用户的双向认证密钥
 * @param {string} username 用户名
 * @param {string} secret 密钥
 */
export async function saveUserSecret(username, secret) {
  let user = await AdminModel.findOne({ username })
  if (!user) {
    throw new Error('未找到指定用户')
  }
  user.authSecret = secret
  return user.save()
}

/**
 * 获取临时的 OptAuthUrl
 * @param {string} secret 密钥
 */
export function getOptAuthUrl() {
  let { base32, otpauth_url } = speakeasy.generateSecret({ name: 'control.cybereits.com' })
  return { base32, otpauth_url }
}

/**
 * 根据传入密钥验证校验码
 * @param {string} secret 密钥
 * @param {string} token 校验码
 */
export function validSecret(secret, token) {
  return speakeasy.totp.verify({
    encoding: 'base32',
    secret,
    token,
  })
}
