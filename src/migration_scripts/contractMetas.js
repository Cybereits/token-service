/* eslint-disable */
require('babel-register')({
  presets: ['es2015', 'stage-0'],
})

const { contractMetaModel } = require('../core/schemas')
const { CONTRACT_NAMES } = require('../core/enums')

let {
  createTimeStamp,
  code,
  abi,
  address,
  subContractAddress,
  deployOwnerAddr,
} = require('../contracts/token.json')

let {
  tokenSupply,
  contractDecimals,
  teamLockPercent,
  teamAddr01,
  teamAddr02,
  teamAddr03,
  teamAddr04,
  teamAddr05,
  teamAddr06,
} = require('../config/const')

contractMetaModel.create({
  name: CONTRACT_NAMES.cre,
  decimal: contractDecimals,
  codes: code[1],
  abis: abi[1],
  owner: deployOwnerAddr,
  address,
  args: JSON.stringify({
    tokenSupply,
    contractDecimals,
    lockPercent: teamLockPercent,
    lockAddresses: [
      teamAddr01,
      teamAddr02,
      teamAddr03,
      teamAddr04,
      teamAddr05,
      teamAddr06,
    ],
  }),
  createAt: new Date(createTimeStamp)
})

contractMetaModel.create({
  name: CONTRACT_NAMES.lock,
  codes: code[0],
  abis: abi[0],
  owner: deployOwnerAddr,
  address: subContractAddress,
  args: JSON.stringify([
    teamAddr01,
    teamAddr02,
    teamAddr03,
    teamAddr04,
    teamAddr05,
    teamAddr06,
  ]),
  createAt: new Date(createTimeStamp)
})
