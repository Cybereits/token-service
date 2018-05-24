/* eslint-disable */
require('babel-register')({
  presets: ['es2015', 'stage-0'],
})

const { contractMetaModel } = require('../core/schemas')

let {
  name,
  code,
  abi,
  address,
  subContractAddress,
} = require('../contracts/token.json')

contractMetaModel.insertMany([
  {
    name,
    code,
    abi,
    address,
    subContractAddress,
  },
])
