const test = require('tape')
const testServer = require('@twilson63/test-server')
const app = require('../server')



const fetch = require('node-fetch')

test('POST /api/reviews successfully', async t => {
  t.plan(1)

  const server = testServer(app)

  const result = await fetch(server.url + '/api/reviews', {
    method: 'POST',

    headers: {
      'Content-Type': 'application/json',
      /*Authorization: `Bearer ${token}`*/
      'Cookie' : 'session=foobar'

    },
    body: JSON.stringify(
      {
      id:"roadhouse-1-tom",
      movieId:"roadhouse-1",
      rating:5,
      summary:"Swayze Crazee"
    })
  }).then(r => r.json())

  t.ok(result.ok)

  server.close()
})
