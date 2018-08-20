import { exec } from 'child_process'
// import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

const exportFileDir = path.resolve(__dirname, '../../static/')
const ITERATIONS = 1000
const ALGORITHM = 'sha256'

function getHash(str, length = 10) {
  return crypto.pbkdf2Sync(str, Date.now().toString(), ITERATIONS, length, ALGORITHM).toString('hex')
}

/**
 * 导出数据库实体到 Csv 文件
 * @param {String} collection_name 表名称
 * @param {Array<String>} fields 字段数组
 */
export function exportToCsv(collection_name, fields) {
  let output_filename = `${getHash(collection_name)}.csv`
  let output_filepath = path.resolve(exportFileDir, `${output_filename}`)

  let command = `mongoexport --db ethService --collection ${collection_name} --out ${output_filepath} --type csv --fields ${fields.join(',')}`

  return new Promise((resolve, reject) => {
    exec(command, (error) => {
      if (error) {
        reject(error)
      } else {
        resolve(output_filename)
      }
    })
  })
}

export function exportAccountInfo() {
  return exportToCsv('ethaccounts', ['account', 'balances.eth', 'balances.cre'])
}
