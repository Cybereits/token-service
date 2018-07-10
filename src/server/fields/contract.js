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

import { ContractMetaModel, TxRecordModel } from '../../core/schemas'
import { createAndDeployContract, getContractInstance } from '../../core/scenes/contract'
import { getConnByAddressThenUnlock } from '../../core/scenes/account'
import { CONTRACT_NAMES, STATUS } from '../../core/enums'
import { establishContractListener } from '../../core/listeners/utils'
import { updateAllAccounts } from '../../core/jobs/updateSysAccount'
import { creContractArgs, commonContractArgs, contractMetaResult, contractFilter } from '../types/plainTypes'

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
      console.error(err)
    })
    throw new Error('合约编译失败')
  }

  return output.contracts
}

/**
 * 获取合约实例并解锁地址
 * @param {string} contractName 合约名称
 * @param {string} address 解锁账户地址
 */
async function getContractAndUnlockAccount(contractName, address) {
  let contractPromise = getContractInstance(contractName)
  let unlockPromise = getConnByAddressThenUnlock(address)

  // 解锁账户
  await unlockPromise
  // 获取合约实例
  let contract = await contractPromise
  return contract
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
  async resolve() {
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
      type: new NotNull(str),
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
      deployer,
      [
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
        owner: deployer,
        address: contractInstance.options.address,
        args: JSON.stringify(contractArgs),
        isERC20: true,
      },
      // 保存锁仓合约信息
      {
        name: CONTRACT_NAMES.lock,
        codes: lockContractCode,
        abis: lockContractAbi,
        owner: deployer,
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
      type: new NotNull(str),
      description: '部署账户',
    },
    contractName: {
      type: new NotNull(str),
      description: 'kyc 合约名称',
    },
  },
  async resolve(root, { deployer, contractName }) {
    let compiledContractSource = compileContract({
      'Ownable.sol': readSoliditySource(CONTRACT_NAMES.ownable),
      [MAIN_SOURCE_NAME]: readSoliditySource(CONTRACT_NAMES.kyc),
    })

    let contractCode = compiledContractSource[`${MAIN_SOURCE_NAME}:${CONTRACT_NAMES.kyc}`].bytecode
    let contractAbi = compiledContractSource[`${MAIN_SOURCE_NAME}:${CONTRACT_NAMES.kyc}`].interface

    let [contractInstance] = await createAndDeployContract(
      `0x${contractCode}`,
      JSON.parse(contractAbi),
      deployer,
      [
        contractName,
      ]
    ).catch((err) => {
      throw new Error(`合约部署失败 ${err.message} `)
    })

    // 保存代币合约信息
    return ContractMetaModel
      .create({
        name: contractName,
        codes: contractCode,
        abis: contractAbi,
        owner: deployer,
        address: contractInstance.options.address,
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
      type: new NotNull(str),
      description: '部署账户',
    },
    contractArgs: {
      type: commonContractArgs,
      description: '资产合约初始化参数',
    },
    kycAddress: {
      type: new NotNull(str),
      description: 'kyc 合约地址',
    },
  },
  async resolve(root, { deployer, contractArgs, kycAddress }) {
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
      deployer,
      [
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
        owner: deployer,
        address: contractInstance.options.address,
        args: JSON.stringify(contractArgs),
        isERC20: true,
      })
      .then(() => {
        establishContractListener(contractName)
        updateAllAccounts([contractName])
        return '合约部署成功!'
      })
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
      type: str,
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
      .then(() => {
        establishContractListener(name)
        updateAllAccounts([name])
        return 'success'
      })
  },
}

// #endregion

// #region 合约特殊方法

export const readContractMethod = {
  type: str,
  description: '调用合约只读方法',
  args: {
    contractName: {
      type: new NotNull(str),
      description: '合约名称',
    },
    methodName: {
      type: new NotNull(str),
      description: '方法名称',
    },
    paramArrInJson: {
      type: new NotNull(str),
      description: '参数数组序列化后的 json 字符串',
    },
  },
  async resolve(root, {
    contractName,
    methodName,
    paramArrInJson,
  }) {
    let contract = await getContractInstance(contractName)
    let paramArr = JSON.parse(decodeURIComponent(paramArrInJson)) || []
    return contract.methods[methodName](...paramArr).call(null)
  },
}

export const writeContractMethod = {
  type: str,
  description: '调用合约写入方法',
  args: {
    caller: {
      type: new NotNull(str),
      description: '调用此方法的钱包地址',
    },
    contractName: {
      type: new NotNull(str),
      description: '合约名称',
    },
    methodName: {
      type: new NotNull(str),
      description: '方法名称',
    },
    paramArrInJson: {
      type: new NotNull(str),
      description: '参数数组序列化后的 json 字符串',
    },
  },
  async resolve(root, {
    caller,
    contractName,
    methodName,
    paramArrInJson,
  }, { session }) {
    let contract = await getContractAndUnlockAccount(contractName, caller)
    let paramArr = JSON.parse(decodeURIComponent(paramArrInJson))
    // 解锁锁定的代币
    return new Promise((resolve, reject) => {
      contract
        .methods[methodName](...paramArr)
        .send({ from: caller })
        .on('transactionHash', async (txid) => {
          let { address, symbol } = await ContractMetaModel.findOne({ name: contractName })
          await TxRecordModel.create({
            amount: 0,
            from: caller,
            to: address,
            status: STATUS.sending,
            tokenType: symbol,
            creator: session.admin.username,
            executer: session.admin.username,
            txid,
            comment: `调用合约 ${contractName} 函数 ${methodName}`,
            sendTime: new Date(),
          }).catch(reject)
          // 返回的是成功发出后的 txid
          resolve(txid)
        })
        .on('error', reject)
        .catch(reject)
    })
  },
}

// #endregion
