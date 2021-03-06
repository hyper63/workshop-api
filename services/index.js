const hyper = require('@hyper.io/connect')
const { Async } = require('crocks')
const { always, assoc, compose, over, lensProp, inc } = require('ramda')

if (!globalThis.fetch) {
  throw new Error('fetch is not defined')
}

const asyncFetch = Async.fromPromise(fetch)
const toJSON = res => {
  // Response will only be ok if status is between 200 - 299
  if (res.ok) {
    return Async.fromPromise(res.json.bind(res))()
  } else {
    return Async.fromPromise(res.text.bind(res))()
      .map(msg => ({ ok: false, status: res.status, message: msg }))
      .chain(Async.Rejected)
  }
}

module.exports = {
  data: {
    create,
    update,
    get,
    query,
    del
  },
  search: {
    query: find,
    createIndex: createSearchIndex,
    create: addDocumentToIndex,
    del: removeDocumentFromIndex
  },
  cache: {
    inc: increment,
    set,
    get: getFromCache,
    list
  },
  storage: {

  }
}

function list() {
  return asyncFetch(hyper.url('cache', '_query') + '?pattern=*', {
    headers: {
      Authorization: `Bearer ${hyper.token()}`
    }
  }).chain(toJSON)
}

function increment(id, prop) {
  return getFromCache(id)
    .coalesce(
      always({ count: 1, [prop]: 1 }),
      compose(
        over(lensProp('count'), inc),
        over(lensProp(prop), inc)
      )
    )
    .chain(v => set(id, v))
}

function set(key, value) {
  return asyncFetch(hyper.url('cache'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${hyper.token()}`
    },
    body: JSON.stringify({
      key,
      value
    })
  }).chain(toJSON)
}

function getFromCache(key) {
  return asyncFetch(hyper.url('cache', key), {
    headers: {
      Authorization: `Bearer ${hyper.token()}`
    }
  }).chain(toJSON)
}

/**
 * @param {object} selector
 * @param {array} fields
 * @param {number} limitß
 */
function query(selector = {}, fields, limit = 20) {
  let body = { selector }
  body = fields ? assoc('fields', fields, body) : body
  body = limit ? assoc('limit', limit, body) : body

  return asyncFetch(hyper.url('data', '_query'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${hyper.token()}`
    },
    body: JSON.stringify(body)
  }).chain(toJSON)
}



function update(id, doc) {
  return asyncFetch(hyper.url('data', id), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${hyper.token()}`
    },
    body: JSON.stringify(doc)
  }).chain(toJSON)
}

function create(doc) {
  return asyncFetch(hyper.url('data'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${hyper.token()}`
    },
    body: JSON.stringify(doc)
  }).chain(toJSON)
}

function get(id) {
  return asyncFetch(hyper.url('data', id), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${hyper.token()}`,
      Accept: 'application/json'
    }
  }).chain(toJSON)
}

function del(id) {
  return asyncFetch(hyper.url('data', id), {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${hyper.token()}`,
      Accept: 'application/json'
    }
  }).chain(toJSON)
}

/**
 * @param {string} query
 * @param {array} fields - ['title', 'year']
 * @param {object} filter - { type: 'movie' }
*/
function find(query, fields, filter) {
  let body = { query }
  body = fields ? assoc('fields', fields, body) : body
  body = filter ? assoc('filter', filter, body) : body

  return asyncFetch(hyper.url('search', '_query'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${hyper.token()}`
    },
    body: JSON.stringify(body)
  }).chain(toJSON)
}

/** 
* @param {string} name - 'movies'
* @param {array} fields - ['title', 'year']
* @param {array} storeFields - ["id", "title", "type", "year"]
*/
function createSearchIndex(name, fields, storeFields) {

  console.log('services createSearchIndex')
  return asyncFetch(hyper.url('search', name), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${hyper.token()}`
    },
    body: JSON.stringify({ fields, storeFields  })
  }).chain(toJSON)

}

function addDocumentToIndex(key, doc) {
  return asyncFetch(hyper.url('search'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${hyper.token()}`
    },
    body: JSON.stringify({key,doc})
  }).chain(toJSON)
}

function removeDocumentFromIndex(key) {
  console.log('services removeDocumentFromIndex')
  return asyncFetch(hyper.url('search', key), {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${hyper.token()}`
    }
  }).chain(toJSON)
}

