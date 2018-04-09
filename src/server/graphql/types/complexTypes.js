import {
  GraphQLObjectType as Obj,
  GraphQLInt as int,
  GraphQLList as List,
} from 'graphql'

let cache = {}

const PaginationData = new Obj({
  name: 'paginationData',
  description: '分页数据',
  fields: {
    total: {
      type: int,
      description: '条目总数',
    },
    pageIndex: {
      type: int,
      description: '页码',
    },
    pageSize: {
      type: int,
      description: '每页容量',
    },
    pageCount: {
      type: int,
      description: '页数',
    },
  },
})

// eslint-disable-next-line
export const PaginationWrapper = (innerType, name = 'PaginationList', description = '标准分页数据类型') => {

  if (!innerType) {
    throw new TypeError('First arguments [innerType] is required and should be a GraphqlObjectType instance.')
  }

  if (!cache[innerType]) {
    let type = new Obj({
      name,
      description,
      fields: {
        pagination: {
          type: PaginationData,
          description: '分页数据',
        },
        list: {
          type: new List(innerType),
          description: '列表数据',
        },
      },
    })
    cache[innerType] = type
  }

  return cache[innerType]
}

/**
 * 生成分页结果数据格式
 * @param {array<object>} list 列表数据
 * @param {number} pageIndex 当前查询页码
 * @param {number} pageSize 当前查询的页容
 * @param {number} pageCount 当前查询的结果页数量
 * @param {number} total 当前查询的结果条目数量
 */
export const PaginationResult = (list, pageIndex, pageSize, pageCount, total) => ({ pagination: { total, pageCount, pageIndex, pageSize }, list: list })
