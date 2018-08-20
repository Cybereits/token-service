import { exec } from 'child_process'
import path from 'path'

const exportFileDir = path.resolve(__dirname, '../../static/')

/**
 * 导出数据库实体到 Csv 文件
 * @param {String} collection_name 表名称
 * @param {Array<String>} fields 字段数组
 * @param {String} filename 导出的文件名
 */
export function exportToCsv(collection_name, fields, filename) {
  let output_filename = `${filename || collection_name}.csv`
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
  return exportToCsv('ethaccounts', ['account', 'balances.eth', 'balances.cre', 'comment'], '账户信息')
}
