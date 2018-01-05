import solc from 'solc'
import fs from 'fs'
import path from 'path'
import { contractJson, deployContract } from '../utils/contract'
import web3 from '../../framework/web3'
import { deployOwnerAddr, deployOwnerSecret, teamFreezePercent } from '../../config/const'

const contractName = 'token'

let contractCode = []
let contractAbi = []
let name
let meta

function exec() {

  switch (contractName) {
    case 'token':
      meta = {
        sources: {
          'CybereitsToken.sol': fs.readFileSync(path.resolve(__dirname, '../contracts/CybereitsToken.sol')).toString(),
        },
      }
      name = 'Cybereits Token'
      break
  }

  let output = solc.compile(meta, 1)
  let errCounter = 0

  if (output.errors) {
    output.errors.forEach((err) => {
      console.log(err)
      if (~err.indexOf('Error')) {
        errCounter += 1
      }
    })
  }

  if (errCounter === 0) {
    Object
      .keys(output.contracts)
      .forEach((contractName) => {
        contractCode.push(output.contracts[contractName].bytecode)
        contractAbi.push(output.contracts[contractName].interface)
      })

    contractJson(contractName, {
      Date: new Date().toLocaleString(),
      name,
      address: [],
      code: contractCode,
      abi: contractAbi,
    })
      .then(() => {
        deployContract(
          contractName,
          `0x${contractCode[0]}`,
          // contractCode, //.map(t => t === '' ? t : `0x${t}`),
          // contractAbi,
          JSON.parse(contractAbi[0]),
          deployOwnerAddr,
          deployOwnerSecret,
          [teamFreezePercent]
          // [`0x${teamFreezePercent}`]
        )
          .then(() => {
            console.log('合约部署成功!')
          })
          .catch((err) => {
            console.error(`合约部署失败 ${err.message}`)
            process.exit(0)
          })
      })
      .catch((err) => {
        console.error(`合约编译失败 ${err.message}`)
        process.exit(0)
      })
  } else {
    console.error('合约编译失败')
    process.exit(0)
  }
}

exec()
