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
 console.log('isProtectedEndpoint', {method, path})
return not(
  isNil(
    find(endpoint => endpoint.method === method && includes( endpoint.path, path) , endpoints)
  )
) && isNil(
  find(endpoint => endpoint.method === method && includes( endpoint.path, path) , okEndpoints)
)
}

module.exports = (req, res, next) => {
    const {method, path} = req 
    // check path, if path is protected
    if (isProtectedEndpoint({method, path})) {
      console.log('isProtectedEndpoint', true)
      // check is session.user exists
      console.log({session: req.session})
      if (req.session.user) {
        // get user name
        console.log('hooray, authorized!', 'req.session.user.login', req.session.user.login)

        req.user = req.session.user.login
        next()
      } else {
        console.log({status: 401, message: 'not authorized'})
        next({status: 401, message: 'not authorized'})
      }
    } else {
      console.log('isProtectedEndpoint', false)
        next()
    }
  }