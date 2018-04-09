import {
  GraphQLObjectType as Obj,
  GraphQLInt as int,
  GraphQLList as List,
} from 'graphql'

let cache = {}

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
        items: {
          type: new List(innerType),
          description: '列表',
        },
      },
    })
    cache[innerType] = type
  }

  return cache[innerType]
}
