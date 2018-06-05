export const sessionValid = async (ctx, next) => {
  if (/adminRegister/.test(ctx.request.body.query) && ctx.session.admin.role == 1) {
    await next();
  } else if (ctx.path == '/data' || /admin/.test(ctx.request.body.query) || ctx.session.admin) {
    await next();
  } else {
    ctx.response.status = 401;
  }
}
