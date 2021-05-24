const test = require('tape')
const testServer = require('@twilson63/test-server')
const app = require('../server')


const fetch = require('node-fetch')

test('POST /api/movies/_search', async t => {
  t.plan(1)
  const server = testServer(app)

  const result = await (await fetch(server.url + '/api/movies/_search', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      title: 'Roadhouse'
    })
  })).json()

  t.ok(result.ok)

  server.close()

})

