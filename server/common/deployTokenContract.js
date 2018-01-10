import solc from 'solc'
import fs from 'fs'
import path from 'path'

import {
  seriliazeContractData,
  updateContractData,
  createAndDeployContract,
} from '../utils/contract'

import {
  deployOwnerAddr,
  deployOwnerSecret,
  tokenSupply,
  contractDecimals,
  teamLockPercent,
  teamAddr01,
  teamAddr02,
  teamAddr03,
  teamAddr04,
  teamAddr05,
  teamAddr06,
} from '../../config/const'

const contractName = 'token'

let contractCode = []
let contractAbi = []
let name = 'Cybereits Token'

let meta = {
  sources: {
    'CybereitsToken.sol': fs.readFileSync(path.resolve(__dirname, '../contracts/CybereitsToken.sol')).toString(),
  },
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

  seriliazeContractData(contractName, {
    name,
    createTimeStamp: Date.now(),
    code: contractCode,
    abi: contractAbi,
  })
    .then(() => {
      createAndDeployContract(
        `0x${contractCode[1]}`,
        JSON.parse(contractAbi[1]),
        deployOwnerAddr,
        deployOwnerSecret,
        // 合约第1个参数 代币总量
        // 合约第2个参数 decimals
        // 合约第3个参数 团队锁定份额 百分比:0-100
        // 合约第4-9个参数 团队地址1-6
        [
          tokenSupply,
          contractDecimals,
          teamLockPercent,
          teamAddr01,
          teamAddr02,
          teamAddr03,
          teamAddr04,
          teamAddr05,
          teamAddr06,
        ]
      )
        .then(async ([compiledContract, contractInstance]) => {
          console.log('合约部署成功!')
          // console.log('compiledContract', compiledContract.methods)
          let lockContractAddr = await compiledContract
            .methods
            .teamLockAddr()
            .call(null)

          await updateContractData(contractName, (data) => {
            let temp = data
            temp.address = [contractInstance.options.address]
            temp.subContractAddress = [lockContractAddr]
            return temp
          })

          process.exit(0)
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

