/* eslint-disable */
require('babel-register')({
  presets: ['es2015', 'stage-0'],
})

const { contractMetaModel } = require('../core/schemas')
const { CONTRACT_NAMES } = require('../core/enums')

let {
  name,
  code,
  abi,
  address,
  subContractAddress,
  deployOwnerAddr,
} = require('../contracts/token.json')

// todo...
contractMetaModel.create({
  name,
  decimal: 18,
  code,
  abi,
  owner: deployOwnerAddr,
  address,
})

contractMetaModel.create({
  name: CONTRACT_NAMES.lock,
  code,
  abi,
  address: subContractAddress,
})
