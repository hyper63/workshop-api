const {curry, contains, split, compose} = require('ramda')

module.exports = curry((requestedAppJWTScopes,  allowedScope) => compose(
    contains( allowedScope),
    split(' ')
  )(requestedAppJWTScopes))
  
  