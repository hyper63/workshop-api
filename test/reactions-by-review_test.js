const test = require('tape')
const testServer = require('@twilson63/test-server')
const app = require('../server')



const fetch = require('node-fetch')

test('GET /api/reviews/:id/reactions successfully', async t => {
  t.plan(1)

  const server = testServer(app)

  const result = await fetch(server.url + '/api/reviews/review-1/reactions', {
    headers: {
      /*Authorization: `Bearer ${token}`*/
    }
  }).then(r => r.json())

  t.ok(result.ok)

  server.close()
})

