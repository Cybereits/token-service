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
    current: {
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

export const PaginationWrapper = (innerType) => {
  if (!innerType) {
    throw new TypeError('First arguments [innerType] is required and should be a GraphqlObjectType instance.')
  }

  if (!cache[innerType]) {
    let type = new Obj({
      name: `${innerType.name}_pagination`,
      description: `分页数据 - ${innerType.description}`,
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
 * @param {number} total 当前查询的结果条目数量
 */
export const PaginationResult = (list, pageIndex, pageSize, total) => ({ pagination: { total, pageCount: Math.ceil(total / pageSize), current: pageIndex + 1, pageSize }, list: list })
