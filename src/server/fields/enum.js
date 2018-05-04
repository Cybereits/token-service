import {
  GraphQLList as List,
} from 'graphql'

import { STATUS } from '../../core/enums'
import { hashResult } from '../types/plainTypes'

const statusMatrix = Object.entries(STATUS)

let EnumTypeGen = (desc, matrix) => ({
  type: new List(hashResult),
  description: desc,
  async resolve() {
    return matrix.map(arr => ({ name: arr[0], value: arr[1] }))
  },
})

export const commonStatusEnum = EnumTypeGen('查询通用状态枚举类型', statusMatrix)
