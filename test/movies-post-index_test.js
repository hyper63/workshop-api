const test = require('tape')
const testServer = require('@twilson63/test-server')
const app = require('../server')



const fetch = require('node-fetch')

test('POST /api/movies successfully', async t => {
  t.plan(1)

  const server = testServer(app)

  const result = await fetch(server.url + '/api/movies', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      /*Authorization: `Bearer ${token}`*/
    },
    body: JSON.stringify({
      title: 'Ghostbusters',
      year: '1984',
      actors: ['Bill Murray', 'Dan Aykroyd'],
      genre: 'comedy'
    })
  }).then(r => r.json())

  t.ok(result.ok)

  server.close()
})
