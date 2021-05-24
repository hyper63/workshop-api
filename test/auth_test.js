const test = require('tape')

const auth = require('../middleware/auth')

test('POST /api/movies should be protected', t => {
  t.plan(1)
  let req = {
    session: { },
    method: 'POST',
    path: '/api/movies'
  }
  let next = (e) => t.equal(e.message, 'not authorized')

  auth.check(req, null, next)

})
