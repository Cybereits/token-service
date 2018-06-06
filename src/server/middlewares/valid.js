export const sessionValid = async (ctx, next) => {
  if (/adminRegister/.test(ctx.request.body.query)) {
    if (ctx.session.admin && ctx.session.admin.role === 1) {
      await next()
    } else {
      ctx.response.status = 401
    }
  } else if (ctx.path === '/data' || /admin/.test(ctx.request.body.query) || ctx.session.admin) {
    await next()
  } else {
    ctx.response.status = 401
  }
}
