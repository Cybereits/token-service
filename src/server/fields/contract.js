import abi from 'ethereumjs-abi'
import solc from 'solc'
import fs from 'fs'
import path from 'path'
import {
  GraphQLList as List,
  GraphQLString as str,
  GraphQLNonNull as NotNull,
  GraphQLInt as int,
} from 'graphql'

import { creClientConnection } from '../../framework/web3'
import { ContractMetaModel } from '../../core/schemas'
import { createAndDeployContract } from '../../core/scenes/contract'
import { unlockAccount } from '../../core/scenes/account'
import { getContractInstance } from '../../core/scenes/token'
import { CONTRACT_NAMES } from '../../core/enums'
import { creContractArgs, commonContractArgs, ethAccount, contractMetaResult, contractFilter } from '../types/plainTypes'

function readSoliditySource(filename) {
  return fs.readFileSync(path.resolve(__dirname, `../../contracts/${filename}.sol`)).toString()
}

const MAIN_SOURCE_NAME = 'main'

/**
 * 编译合约
 * @param {object} sources 合约源文件对象
 * @returns {object} 编译后的合约对象
 */
function compileContract(sources) {
  const meta = {
    sources,
    settings: {
      optimizer: {
        enabled: true,
        runs: 500,
      },
    },
  }

  const output = solc.compile(meta, 1)

  if (output.errors && output.errors.length > 0) {
    output.errors.forEach((err) => {
      console.log(err)
    })
    throw new Error('合约编译失败')
  }

  return output.contracts
}

// #region 合约查询及创建

export const queryAllContract = {
  type: new List(contractMetaResult),
  description: '查询所有的合约信息',
  args: {
    filter: {
      type: contractFilter,
      description: '合约查询过滤条件',
    },
  },
  async resolve(root, { filter }) {
    return ContractMetaModel.find(filter).sort({ createAt: -1 })
  },
}

export const queryCREContractAbi = {
  type: str,
  description: '查询 cre 代币合约 abi',
  async resolve(root, { name }) {
    let contract = await ContractMetaModel.findOne({ name: CONTRACT_NAMES.cre })
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
        ], [
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
    const { address, secret } = deployer
    const {
      tokenSupply,
      contractDecimals,
      lockPercent,
      lockAddresses,
    } = contractArgs

    let compiledContractSource = compileContract({
      'SafeMath.sol': readSoliditySource(CONTRACT_NAMES.math),
      'Ownable.sol': readSoliditySource(CONTRACT_NAMES.ownable),
      'ERC20.sol': readSoliditySource(CONTRACT_NAMES.erc20),
      'Token.sol': readSoliditySource(CONTRACT_NAMES.token),
      [MAIN_SOURCE_NAME]: readSoliditySource(CONTRACT_NAMES.cre),
    })

    let creContractCode = compiledContractSource[`${MAIN_SOURCE_NAME}:${CONTRACT_NAMES.cre}`].bytecode
    let creContractAbi = compiledContractSource[`${MAIN_SOURCE_NAME}:${CONTRACT_NAMES.cre}`].interface
    let lockContractCode = compiledContractSource[`${MAIN_SOURCE_NAME}:${CONTRACT_NAMES.lock}`].bytecode
    let lockContractAbi = compiledContractSource[`${MAIN_SOURCE_NAME}:${CONTRACT_NAMES.lock}`].interface

    let [compiledContract, contractInstance] = await createAndDeployContract(
      `0x${creContractCode}`,
      JSON.parse(creContractAbi),
      address,
      secret, [
        tokenSupply,
        contractDecimals,
        lockPercent,
        ...lockAddresses,
      ]
    ).catch((err) => {
      throw new Error(`合约部署失败 ${err.message} `)
    })

    let lockContractAddr = await compiledContract.methods.teamLockAddr().call(null)

    return ContractMetaModel.insertMany([
      // 保存代币合约信息
      {
        name: CONTRACT_NAMES.cre,
        symbol: 'cre',
        decimal: contractDecimals,
        codes: creContractCode,
        abis: creContractAbi,
        owner: address,
        address: contractInstance.options.address,
        args: JSON.stringify(contractArgs),
        isERC20: true,
      },
      // 保存锁仓合约信息
      {
        name: CONTRACT_NAMES.lock,
        codes: lockContractCode,
        abis: lockContractAbi,
        owner: address,
        address: lockContractAddr,
        args: JSON.stringify(lockAddresses),
      },
    ])
      .then(() => '合约部署成功!')
      .catch((err) => {
        throw new Error(`合约保存失败 ${err.message} `)
      })
  },
}

export const deployKycContract = {
  type: str,
  description: '部署 KYC 合约',
  args: {
    deployer: {
      type: ethAccount,
      description: '部署账户',
    },
    contractArgs: {
      type: commonContractArgs,
      description: 'kyc 合约初始化参数',
    },
  },
  async resolve(root, { deployer, contractArgs }) {
    const { address, secret } = deployer
    const {
      tokenSupply,
      tokenSymbol,
      contractName,
      contractDecimals,
    } = contractArgs

    let compiledContractSource = compileContract({
      'SafeMath.sol': readSoliditySource(CONTRACT_NAMES.math),
      'Ownable.sol': readSoliditySource(CONTRACT_NAMES.ownable),
      [MAIN_SOURCE_NAME]: readSoliditySource(CONTRACT_NAMES.kyc),
    })

    let contractCode = compiledContractSource[`${MAIN_SOURCE_NAME}:${CONTRACT_NAMES.kyc}`].bytecode
    let contractAbi = compiledContractSource[`${MAIN_SOURCE_NAME}:${CONTRACT_NAMES.kyc}`].interface

    let [contractInstance] = await createAndDeployContract(
      `0x${contractCode}`,
      JSON.parse(contractAbi),
      address,
      secret, [
        tokenSupply,
        contractDecimals,
        contractName,
        tokenSymbol,
      ]
    ).catch((err) => {
      throw new Error(`合约部署失败 ${err.message} `)
    })

    // 保存代币合约信息
    return ContractMetaModel
      .create({
        name: contractName,
        symbol: tokenSymbol,
        decimal: contractDecimals,
        codes: contractCode,
        abis: contractAbi,
        owner: address,
        address: contractInstance.options.address,
        args: JSON.stringify(contractArgs),
      })
      .then(() => '合约部署成功!')
      .catch((err) => {
        throw new Error(`合约保存失败 ${err.message} `)
      })
  },
}

export const deployAssetContract = {
  type: str,
  description: '部署资产合约',
  args: {
    deployer: {
      type: ethAccount,
      description: '部署账户',
    },
    contractArgs: {
      type: commonContractArgs,
      description: '资产合约初始化参数',
    },
    kycAddress: {
      type: str,
      description: 'kyc 合约地址',
    },
  },
  async resolve(root, { deployer, contractArgs, kycAddress }) {
    const { address, secret } = deployer
    const {
      tokenSupply,
      tokenSymbol,
      contractDecimals,
      contractName,
    } = contractArgs

    let compiledContractSource = compileContract({
      'SafeMath.sol': readSoliditySource(CONTRACT_NAMES.math),
      'Ownable.sol': readSoliditySource(CONTRACT_NAMES.ownable),
      'ERC20.sol': readSoliditySource(CONTRACT_NAMES.erc20),
      'Token.sol': readSoliditySource(CONTRACT_NAMES.token),
      'KnowYourCustomer.sol': readSoliditySource(CONTRACT_NAMES.kyc),
      [MAIN_SOURCE_NAME]: readSoliditySource(CONTRACT_NAMES.asset),
    })

    let assetContractCode = compiledContractSource[`${MAIN_SOURCE_NAME}:${CONTRACT_NAMES.asset}`].bytecode
    let assetContractAbi = compiledContractSource[`${MAIN_SOURCE_NAME}:${CONTRACT_NAMES.asset}`].interface

    let [contractInstance] = await createAndDeployContract(
      `0x${assetContractCode}`,
      JSON.parse(assetContractAbi),
      address,
      secret, [
        tokenSupply,
        contractDecimals,
        contractName,
        tokenSymbol,
        kycAddress,
      ]
    ).catch((err) => {
      throw new Error(`合约部署失败 ${err.message} `)
    })

    // 保存代币合约信息
    return ContractMetaModel
      .create({
        name: contractName,
        symbol: tokenSymbol,
        decimal: contractDecimals,
        codes: assetContractCode,
        abis: assetContractAbi,
        owner: address,
        address: contractInstance.options.address,
        args: JSON.stringify(contractArgs),
        isERC20: true,
      })
      .then(() => '合约部署成功!')
      .catch((err) => {
        throw new Error(`合约保存失败 ${err.message} `)
      })
  },
}

export const addERC20ContractMeta = {
  type: str,
  description: '添加 ERC20 代币合约',
  args: {
    name: {
      type: new NotNull(str),
      description: '合约名称',
    },
    symbol: {
      type: new NotNull(str),
      description: '代币缩写',
    },
    decimal: {
      type: new NotNull(int),
      description: '代币精度',
    },
    codes: {
      type: new NotNull(str),
      description: '合约 codes（JSON 字符串）',
    },
    abis: {
      type: new NotNull(str),
      description: '合约 abis（JSON 字符串）',
    },
    address: {
      type: new NotNull(str),
      description: '合约部署地址',
    },
  },
  resolve(root, { name, symbol, decimal, codes, abis, address }) {
    return ContractMetaModel.create({
      name,
      symbol,
      decimal,
      codes,
      abis,
      address,
      isERC20: true,
    })
  },
}

// #endregion

// #region 合约特殊方法

export const unlockTeamAllocation = {
  type: str,
  description: '解锁团队锁仓份额',
  args: {
    unlockAccount: {
      type: str,
      description: '解锁地址',
    },
    ethAccount: {
      type: ethAccount,
      description: '调用解锁方法的钱包信息',
    },
  },
  async resolve(root, {
    unlockAddr,
    ethAccount: {
      address,
      secret,
    },
  }) {
    // 解锁账户
    await unlockAccount(creClientConnection, address, secret)

    // 获取合约实例
    let subContract = await getContractInstance(CONTRACT_NAMES.lock)

    // 解锁锁定的代币
    return subContract
      .methods
      .unlock(unlockAddr)
      .send({ from: address })
  },
}

// #endregion
