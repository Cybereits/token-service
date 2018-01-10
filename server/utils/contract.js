import fs from 'fs'
import path from 'path'
import { unlockAccount } from './basic'
import {
  gas,
  gasPrice,
} from '../../config/const'
import web3 from '../../framework/web3'

/**
 * 记录智能合约编译后的 json 数据
 * @param {*} fileName 文件名称
 * @param {*} contractData 写入的合约数据
 */
export function seriliazeContractData(fileName, contractData) {
  let filePath = path.join(__dirname, `../contracts/${fileName}.json`)
  return new Promise((resolve, reject) => {
    let exists = fs.existsSync(filePath)
    if (exists) {
      fs.writeFile(filePath, JSON.stringify(contractData, null, 2), 'utf8', (err) => {
        if (err) {
          console.log(`合约数据写入失败 ${err}`)
          reject(err)
        } else {
          console.log('合约数据写入成功')
          resolve()
        }
      })
    } else {
      fs.appendFile(filePath, JSON.stringify(contractData, null, 2), 'utf8', (err) => {
        if (err) {
          console.log(`合约数据写入失败 ${err}`)
          reject(err)
        } else {
          console.log('合约数据写入成功')
          resolve()
        }
      })
    }
  })
}

/**
 * 记录合约和子合约的部署地址
 * @param {*} fileName 文件名称
 * @param {*} modifier 数据修改函数
 */
export function updateContractData(fileName, modifier) {
  console.assert(typeof modifier === 'function', 'updateContractData 接受第二个参数 modifier 必须是有效函数')
  return new Promise((resolve, reject) => {
    let filePath = path.join(__dirname, `../contracts/${fileName}.json`)
    let exists = fs.existsSync(filePath)
    if (exists) {
      fs.readFile(filePath, 'utf8', (error, data) => {
        if (error) {
          reject(new Error(`读取合约数据文件失败: ${error}`))
        } else {
          let t = JSON.parse(data)
          let newData = modifier(t)
          fs.writeFile(filePath, JSON.stringify(newData, null, 2), 'utf8', (err) => {
            if (err) {
              reject(new Error(`合约数据更新失败: ${err}`))
            } else {
              console.log('合约数据更新成功.')
              resolve()
            }
          })
        }
      })
    } else {
      reject(new Error('合约数据更新失败: 未找到对应的合约数据文件.'))
    }
  })
}

/**
 * 订阅合约事件
 * @param {*} contract 合约对象
 * @param {*} handlerFunc 事件处理函数
 */
export function subscribeContractEvents(contract, handlerFunc) {
  contract.events.allEvents({ fromBlock: 0, toBlock: 'latest' }, handlerFunc && handlerFunc())
}

/**
 * 部署合约到链上
 * @param {*} connect web3链接
 * @param {*} contract 合约对象
 * @param {*} code 合约code
 * @param {*} deployAccount 部署合约的钱包地址
 * @param {*} accountPwd 部署合约的钱包秘钥
 * @param {*} contractArguments 部署合约的参数数组
 */
async function deploy(connect, contract, code, deployAccount, accountPwd, contractArguments) {
  await unlockAccount(connect, deployAccount, accountPwd, 20)
  return contract.deploy({ data: code, arguments: contractArguments })
}

/**
 * 创建并部署合约
 * @param {*} contractCode 合约code
 * @param {*} contractAbi 合约abi
 * @param {*} deployAccount 部署合约的钱包地址
 * @param {*} accountPwd 部署合约的钱包秘钥
 * @param {*} contractArguments 部署合约的参数数组
 */
export async function createAndDeployContract(contractCode, contractAbi, deployAccount, accountPwd, contractArguments) {
  let connect = await web3.onWs
  // 创建合约对象
  let compiledContract = new connect.eth.Contract(contractAbi)
  let result = await deploy(connect, compiledContract, contractCode, deployAccount, accountPwd, contractArguments)
  // 合约部署后的实例对象
  let newContractInstance = await result
    .send({
      from: deployAccount,
      gas,
      gasPrice,
    })

  // 锁定部署合约的钱包地址
  connect.eth.personal.lockAccount(deployAccount)
  // 记录合约地址
  compiledContract.options.address = newContractInstance.options.address

  // subscribeContractEvents(compiledContract, (error, event) => {
  //   if (error) {
  //     console.error(error)
  //   } else if (event) {
  //     console.log(event)
  //   }
  // })

  return [compiledContract, newContractInstance]
}
