import abi from 'ethereumjs-abi'
import {
  GraphQLString as str,
  GraphQLNonNull as NotNull,
} from 'graphql'
import solc from 'solc'
import fs from 'fs'
import path from 'path'

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

import {
  seriliazeContractData,
  createAndDeployContract,
} from '../../core/scenes/contract'

export const queryContractAbi = {
  type: str,
  description: '查询代币合约 abi',
  resolve() {
    let result = abi.rawEncode(
      [
        'uint256',
        'uint256',
        'uint256',
        'address',
        'address',
        'address',
        'address',
        'address',
        'address',
      ],
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
      ],
    )
    return result.toString('hex')
  },
}

export const deployTokenContract = {
  type: str,
  description: '部署代币、锁仓合约',
  args: {
    name: {
      type: new NotNull(str),
      description: '合约唯一标志',
    },
    contractSourceFileName: {
      type: new NotNull(str),
      description: '合约源码文件名称',
    },
  },
  async resolve(root, { name, contractSourceFileName }) {
    const filepath = path.resolve(__dirname, `../../contracts/${contractSourceFileName}.sol`)
    if (!fs.existsSync(filepath)) {
      throw new Error('未找到对应的合约文件')
    }
    const meta = {
      sources: {
        'contract.sol': fs.readFileSync(filepath).toString(),
      },
      settings: {
        optimizer: {
          enabled: true,
          runs: 500,
        },
      },
    }
    // 编译合约
    const output = solc.compile(meta, 1)

    let errCounter = 0
    let contractCode = []
    let contractAbi = []

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

      let [compiledContract, contractInstance] = await createAndDeployContract(
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
      ).catch((err) => {
        throw new Error(`合约部署失败 ${err.message}`)
      })

      let lockContractAddr = await compiledContract
        .methods
        .teamLockAddr()
        .call(null)

      // 持久化合约信息
      return seriliazeContractData(
        name,
        contractCode,
        contractAbi,
        [contractInstance.options.address],
        [lockContractAddr],
      )
        .then(() => {
          console.log('合约部署成功!')
          return 'success'
        })
        .catch((err) => {
          throw new Error(`合约保存失败 ${err.message}`)
        })
    } else {
      throw new Error('合约编译失败')
    }
  },
}
