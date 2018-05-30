import abi from 'ethereumjs-abi'
import { GraphQLString as str, GraphQLNonNull as NotNull } from 'graphql'
import solc from 'solc'
import fs from 'fs'
import path from 'path'

import { creWalletConnect } from '../../framework/web3'
import { contractMetaModel } from '../../core/schemas'
import { createAndDeployContract } from '../../core/scenes/contract'
import { unlockAccount } from '../../core/scenes/account'
import { getContractInstance } from '../../core/scenes/token'
import { CONTRACT_NAMES } from '../../core/enums'
import { creContractArgs, ethAccount } from '../types/plainTypes'

export const queryContractAbi = {
  type: str,
  description: '查询代币合约 abi',
  args: {
    name: {
      type: new NotNull(str),
      description: '已部署的合约名称',
    },
  },
  async resolve(root, { name }) {
    let contract = await contractMetaModel.findOne({ name })
    if (contract) {
      const { decimal, args } = contract
      const { tokenSupply, lockPercent, lockAddresses } = JSON.parse(args)
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
          decimal,
          lockPercent,
          ...lockAddresses,
        ],
      )
      return result.toString('hex')
    } else {
      throw new Error('未找到指定的合约信息')
    }
  },
}

export const deployCREContract = {
  type: str,
  description: '部署代币、锁仓合约',
  args: {
    deployer: {
      type: ethAccount,
      description: '部署账户',
    },
    contractArgs: {
      type: creContractArgs,
      description: 'cre 合约初始化参数',
    },
  },
  async resolve(root, {
    deployer,
    contractArgs,
  }) {
    const { address: deployAddr, secret: deploySecret } = deployer
    const {
      tokenSupply,
      contractDecimals,
      lockPercent,
      lockAddresses,
    } = contractArgs

    const filepath = path.resolve(__dirname, `../../contracts/${CONTRACT_NAMES.cre}.sol`)
    const sourceName = 'default'

    if (!fs.existsSync(filepath)) {
      throw new Error('未找到对应的合约文件')
    }
    const meta = {
      sources: {
        [sourceName]: fs.readFileSync(filepath).toString(),
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

    if (output.errors) {
      output.errors.forEach((err) => {
        console.log(err)
        if (~err.indexOf('Error')) {
          errCounter += 1
        }
      })
    }

    // console.log(Object.keys(output.contracts))
    // console.log(`${sourceName}:${CONTRACT_NAMES.cre}`)
    // console.log(output.contracts[`${sourceName}:${CONTRACT_NAMES.cre}`])

    let creContractCode = output.contracts[`${sourceName}:${CONTRACT_NAMES.cre}`].bytecode
    let creContractAbi = output.contracts[`${sourceName}:${CONTRACT_NAMES.cre}`].interface
    let lockContractCode = output.contracts[`${sourceName}:${CONTRACT_NAMES.lock}`].bytecode
    let lockContractAbi = output.contracts[`${sourceName}:${CONTRACT_NAMES.lock}`].interface

    if (errCounter === 0) {

      let [compiledContract, contractInstance] = await createAndDeployContract(
        `0x${creContractCode}`,
        JSON.parse(creContractAbi),
        deployAddr,
        deploySecret,
        [
          tokenSupply,
          contractDecimals,
          lockPercent,
          ...lockAddresses,
        ]
      ).catch((err) => {
        throw new Error(`合约部署失败 ${err.message}`)
      })

      let lockContractAddr = await compiledContract
        .methods
        .teamLockAddr()
        .call(null)

      return contractMetaModel.insertMany([
        // 保存代币合约信息
        {
          name: CONTRACT_NAMES.cre,
          decimal: contractDecimals,
          codes: creContractCode,
          abis: creContractAbi,
          owner: deployAddr,
          address: contractInstance.options.address,
          args: JSON.stringify(contractArgs),
        },
        // 保存锁仓合约信息
        {
          name: CONTRACT_NAMES.lock,
          codes: lockContractCode,
          abis: lockContractAbi,
          owner: deployAddr,
          address: lockContractAddr,
          args: JSON.stringify(lockAddresses),
        },
      ])
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

export const unlockTeamAllocation = {
  type: str,
  description: '解锁团队锁仓份额',
  args: {
    unlockAccount: {
      type: str,
      description: '解锁地址',
    },
    ethAccount: ethAccount,
  },
  async resolve(root, {
    unlockAddr,
    ethAccount: {
      address,
      secret,
    },
  }) {
    // 解锁账户
    await unlockAccount(creWalletConnect, address, secret)

    // 获取合约实例
    let subContract = await getContractInstance(CONTRACT_NAMES.lock)

    // 解锁锁定的代币
    return subContract
      .methods
      .unlock(unlockAddr)
      .send({ from: address })
  },
}
