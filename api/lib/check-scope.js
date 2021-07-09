const {curry, contains, split, compose, cond, always, map, T, equals, flatten, head} = require('ramda')

const transformWildcardScopes = (scope) => {
  
  const resource = compose(head, split(':'))(scope)
  const movieScopes = ["CREATE","READ","UPDATE","DELETE","SEARCH"]
  const reviewScopes = ["CREATE","READ","UPDATE","DELETE","REACT"]
  const reactionScopes = ["CREATE","READ","UPDATE","DELETE"]
  
  const prefixResourceToScopes = cond([
  [equals("MOVIE"),     always(map(scope => `${resource}:${scope}`, movieScopes))],
  [equals("REVIEW"),    always(map(scope => `${resource}:${scope}`, reviewScopes))],
  [equals("REACTION"),  always(map(scope => `${resource}:${scope}`, reactionScopes))],
  [T,                   always(map(scope => `${resource}:${scope}`,  ["CREATE","READ","UPDATE","DELETE"]))]
]);
  
  return contains("*", scope) ? prefixResourceToScopes(resource) : scope
}

//const requestedAppJWTScopes = 'MOVIE:SEARCH MOVIE:READ REVIEW:* REACTION:*'
//const allowedScope = 'MOVIE:READ'
module.exports = curry((requestedAppJWTScopes,  allowedScope) => compose(
  contains(allowedScope),
  flatten,
  map(transformWildcardScopes),
  split(' ')
)(requestedAppJWTScopes))
  