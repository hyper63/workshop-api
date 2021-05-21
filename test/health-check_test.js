const test = require('tape')
const testServer = require('@twilson63/test-server')

const app = require('../server')
const fetch = require('node-fetch')

test('health check', async t => {
  t.plan(1)
  const server = testServer(app)
  const result = await fetch(server.url).then(r => r.json())
  t.equal(result.name, 'movie review api')
  server.close()
})

