export const sessionValid = function (ctx, next) {
  let { response } = ctx
  if (ctx.session.user) {
    next(ctx)
  } else {
    response.status = 401
  }
}
