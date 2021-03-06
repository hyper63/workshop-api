const test = require('tape')
const testServer = require('@twilson63/test-server')
const app = require('../server')



const fetch = require('node-fetch')

test('POST /api/reactions successfully', async t => {
  t.plan(1)

  const server = testServer(app)

  const result = await fetch(server.url + '/api/reactions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      /*Authorization: `Bearer ${token}`*/

    },
    body: JSON.stringify(
      {
        id: "reaction-ghostbusters-1-tom",
        reviewId: "ghostbusters-1-tom",
        reaction: "like",
        user: 'statepuff marshmello man'
      })
  }).then(r => r.json())
  console.log(result)
  t.ok(result.ok)

  server.close()
})
