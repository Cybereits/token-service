import {
  GraphQLList as List,
} from 'graphql'

import { STATUS, TOKEN_TYPES } from '../../core/enums'
import { getAllTokenContracts } from '../../core/scenes/contract'
import { hashResult } from '../types/plainTypes'

// let EnumTypeGen = (desc, hashMap) => ({
//   type: new List(hashResult),
//   description: desc,
//   async resolve() {
//     return Object.entries(hashMap).map(arr => ({ name: arr[0], value: arr[1] }))
//   },
// })
// EnumTypeGen('代币类型枚举类型', TOKEN_TYPES)

export const statusEnum = {
  type: new List(hashResult),
  description: '交易状态枚举类型',
  async resolve() {
    return Object.entries(STATUS).map(arr => ({ name: arr[0], value: arr[1] }))
  },
}

export const tokenTypeEnum = {
  type: new List(hashResult),
  description: '代币类型枚举类型',
  async resolve() {
    let types = Object.assign({}, TOKEN_TYPES)
    let tokenContracts = await getAllTokenContracts()
    if (tokenContracts && tokenContracts.length > 0) {
      tokenContracts.forEach(({ symbol }) => {
        types[symbol] = symbol
      })
    }
    return Object.entries(types).map(arr => ({ name: arr[0], value: arr[1] }))
  },
}
