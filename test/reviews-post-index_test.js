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
      id:"ghostbusters-1-tom",
      movieId:"ghostbusters-1",
      rating:5,
      summary:"Staypuft Marshmellow Man is the greatest!"
    })
  }).then(r => r.json())

  t.ok(result.ok)

  server.close()
})
