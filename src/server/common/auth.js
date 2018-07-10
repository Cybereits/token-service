export const sessionValidWrapper = (graphqlFieldsSchema) => {
  let __originFunc = graphqlFieldsSchema.resolve
  graphqlFieldsSchema.resolve = (root, _, ctx) => {
    let { session } = ctx
    if (session && session.admin) {
      return __originFunc(root, _, ctx)
    } else {
      return new Error('您没有权限访问该接口')
    }
  }
  return graphqlFieldsSchema
}

export const authLevelWrapper = function (levels, graphqlFieldsSchema) {
  let __originFunc = graphqlFieldsSchema.resolve
  graphqlFieldsSchema.resolve = (root, _, ctx) => {
    let { session } = ctx
    if (session && session.admin && levels.indexOf(session.admin.role) > -1) {
      return __originFunc(root, _, ctx)
    } else {
      return new Error('您没有权限访问该接口')
    }
  }
  return graphqlFieldsSchema
}
