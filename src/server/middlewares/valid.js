export const sessionValid = function (ctx, next) {
  let { response } = ctx
  if (ctx.session.user === 'admin') {
    next(ctx)
  } else {
    response.status = 401
  }
}
