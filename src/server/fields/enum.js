import {
  GraphQLList as List,
} from 'graphql'

import { STATUS, TOKEN_TYPES, CONTRACT_NAMES } from '../../core/enums'
import { hashResult } from '../types/plainTypes'

let EnumTypeGen = (desc, hashMap) => ({
  type: new List(hashResult),
  description: desc,
  async resolve() {
    return Object.entries(hashMap).map(arr => ({ name: arr[0], value: arr[1] }))
  },
})

export const statusEnum = EnumTypeGen('查询通用状态枚举类型', STATUS)
export const tokenTypeEnum = EnumTypeGen('查询代币类型枚举类型', TOKEN_TYPES)
export const contractNameEnum = EnumTypeGen('查询合约名称枚举类型', CONTRACT_NAMES)
