export const sessionValid = ({ request, response, session, path }, next) => {
  if (path === '/data') {
    return next()
  } else if (path === '/graphql' && request.method === 'POST' && /IntrospectionQuery/.test(request.body.query)) {
    return next()
  } else if (/admin/.test(request.body.query) || session.admin) {
    return next()
  } else {
    response.status = 401
    response.body = {
      errors: [{
        message: 'Unauthorized!',
      }],
    }
  }
}
