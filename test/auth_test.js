const test = require('tape')
const auth = require('../middleware/auth')

auth.check.restore()

test('auth middleware test authorized', t => {
  t.plan(1)
  const req = {
    method: 'POST',
    path: '/api/movies',
    session: { user: { login: 'bob'}}
  }

  const next = () => t.ok(true)

  auth.check(req, null, next)



})


test('auth middleware test not authorized', t => {
  t.plan(1)
  const req = {
    method: 'POST',
    path: '/api/movies',
    session: { }
  }

  const next = (e) => t.equal(e.status, 401)

  auth.check(req, null, next)



})


