import crypto from 'crypto'

const len = 128
const iterations = 12000
const digest = 'sha512'

export default {
  /**
   * Hashes a password with optional `salt`, otherwise
   * generate a salt for `pass` and invoke `fn(err, salt, hash)`.
   *
   * @param {String} pwd to hash
   * @param {String} salt salt
   * @returns {Promise<String>} encrypted string
   */
  encrypt: function (pwd, salt) {
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(pwd, salt, iterations, len, digest, (err, hash) => {
        if (err) {
          reject(err)
        } else {
          resolve(hash.toString())
        }
      })
    })
  },
  getHash: function (str) {
    return crypto.pbkdf2Sync(str, 'simpleEncrypt', iterations, 16, digest).toString('base64')
  },
}
