const {not, isNil, find, includes} = require('ramda')

const endpoints = [
  //{method: "GET", path: "/api/reviews"},
  {method: "POST", path: "/api/movies"},
  {method: "PUT", path: "/api/movies"},
  {method: "DELETE", path: "/api/movies"},
  {method: "POST", path: "/api/reviews"},
  {method: "PUT", path: "/api/reviews"},
  {method: "DELETE", path: "/api/reviews"},
  {method: "POST", path: "/api/reactions"}
]


const okEndpoints = [
  { method: 'POST', path: '/api/movies/_search' }
]

const isProtectedEndpoint =  ({method, path}) => {
  return not(
    isNil(
      find(endpoint => endpoint.method === method && includes( endpoint.path, path) , endpoints)
    )
  ) && isNil(
    find(endpoint => endpoint.method === method && includes( endpoint.path, path) , okEndpoints)
  )
}

exports.check = (req, res, next) => {
  const {method, path, session} = req
  // check path, if path is protected
  if (isProtectedEndpoint({method, path})) {
    // check is session.user exists
    if (session.user) {
      // get user name
      req.user = session.user.login
      next()
    } else {
      next({status: 401, message: 'not authorized'})
    }
  } else {
    next()
  }
}
