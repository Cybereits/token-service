export const sessionValid = ({ response, session, path }, next) => {
 if (session.admin) {
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
