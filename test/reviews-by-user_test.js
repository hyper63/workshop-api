const test = require('tape')
const testServer = require('@twilson63/test-server')
const app = require('../server')


const fetch = require('node-fetch')

test('GET /api/reviews', async t => {
  t.plan(1)
  const server = testServer(app)

  const result = await (await fetch(server.url + '/api/reviews')).json()
  t.ok(result.ok)
  server.close()

})
