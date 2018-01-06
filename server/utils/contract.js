import fs from 'fs'
import path from 'path'
import web3 from '../../framework/web3'

export function contractJson(fileName, contractData) {
  let filePath = path.join(__dirname, `../contracts/${fileName}.json`)
  return new Promise((resolve, reject) => {
    let exists = fs.existsSync(filePath)
    if (exists) {
      fs.writeFile(filePath, JSON.stringify(contractData), 'utf8', (err) => {
        if (err) {
          console.log(`合约编译失败 ${err}`)
          reject(err)
        } else {
          console.log('合约编译成功')
          resolve()
        }
      })
    } else {
      fs.appendFile(filePath, JSON.stringify(contractData), 'utf8', (err) => {
        if (err) {
          console.log(`合约编译失败 ${err}`)
          reject(err)
        } else {
          console.log('合约编译成功')
          resolve()
        }
      })
    }
  })
}

export function writeAddress(fileName, address) {
  let filePath = path.join(__dirname, `../contracts/${fileName}.json`)
  let exists = fs.existsSync(filePath)
  if (exists) {
    fs.readFile(filePath, 'utf8', (error, data) => {
      if (error) {
        console.log(`读取合约编译文件失败 ${error}`)
      } else {
        let t = JSON.parse(data)
        t.address.push(address)
        fs.writeFile(filePath, JSON.stringify(t), 'utf8', (err) => {
          if (err) {
            console.log(`地址写入失败: ${err}`)
          } else {
            console.log('地址写入成功.')
          }
        })
      }
    })
  } else {
    console.log('地址写入失败: 未找到对应的合约编译文件.')
  }
}

function eventContract(contract, cb) {
  contract.events.allEvents({ fromBlock: 0, toBlock: 'latest' }, cb && cb())
}

async function createContract(connect, contract, code, deployAccount, accountPwd, contractArguments) {
  await connect.eth.personal.unlockAccount(deployAccount, accountPwd, 20)
  return contract.deploy({ data: code, arguments: contractArguments })
}

export async function deployContract(filename, contractCode, contractAbi, deployAccount, accountPwd, contractArguments) {
  let abi = contractAbi
  let connect = await web3.onWs
  let depContract = new connect.eth.Contract(abi)

  let result = await createContract(connect, depContract, contractCode, deployAccount, accountPwd, contractArguments)
  let newContractInstance = await result.send({
    from: deployAccount,
    gas: 3000000,
    gasPrice: '300000000000',
  })
  let address = newContractInstance.options.address
  connect.eth.personal.lockAccount(deployAccount)
  depContract.options.address = address
  await writeAddress(filename, address)
  eventContract(depContract, (error, event) => {
    if (error) {
      console.error(error)
    } else if (event) {
      console.log(event)
    }
  })
}