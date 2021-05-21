const {not, isNil, find, includes} = require('ramda')

const endpoints = [

    {method: "POST", path: "/api/movies"},
    {method: "PUT", path: "/api/movies"},
    {method: "DELETE", path: "/api/movies"},
  
    {method: "POST", path: "/api/reviews"},
    {method: "PUT", path: "/api/reviews"},
    {method: "DELETE", path: "/api/reviews"},
  
    {method: "POST", path: "/api/reactions"}

]


const isProtectedEndpoint =  ({method, path}) => {
   console.log('isProtectedEndpoint', {method, path})
  return not(isNil(find(endpoint => endpoint.method === method && includes( endpoint.path, path) , endpoints)))
}

module.exports = (req, res, next) => {
    const {method, path} = req 
    // check path, if path is protected
    if (isProtectedEndpoint({method, path})) {
      // check is session.user exists
      if (req.session.user) {
        // get user name
        req.user = req.session.user.login
      } else {
        next({status: 401, message: 'not authorized'})
      }
    } else {
        next()
    }
  }