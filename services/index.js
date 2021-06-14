const hyper = require('@hyper.io/connect')
const { Async } = require('crocks')
const { always, assoc, compose, over, lensProp, inc, dec, mergeLeft } = require('ramda')

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
    del: removeDocumentFromIndex,
    update: updateDocumentToIndex
  },
  cache: {
    increment,
    decrement,
    set,
    get: getFromCache,
    list,
    del: removeFromCache
  },
  storage: {

  }
}

/*********************/
/*      DATA        */
/*********************/
/**
 * @param {object} selector
 * @param {array} fields
 * @param {number} limitß
 */
function query(selector = {}, fields, limit = 100) {
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

/*********************/
/*      SEARCH       */
/*********************/
/**
 * @param {string} query
 * @param {array} fields - ['title', 'year']
 * @param {object} filter - { type: 'movie' }
*/
function find(query, fields, filter) {
  let body = { query }
  body = fields ? assoc('fields', fields, body) : body
  body = filter ? assoc('filter', filter, body) : body

  console.log('services/index.js find() `Bearer ${hyper.token()}`', `Bearer ${hyper.token()}`)

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

function updateDocumentToIndex(key, doc) {
  return removeDocumentFromIndex(key).chain(() => addDocumentToIndex(key,doc))
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

/*********************/
/*      CACHE        */
/*********************/
function list(pattern) {
  return asyncFetch(hyper.url('cache', '_query') + '?pattern=' + pattern, {
    headers: {
      Authorization: `Bearer ${hyper.token()}`
    }
  }).chain(toJSON)
}



function updateMovieStat(id, stat, statValue) {

  return list("movie")
    .map(filter(i=> i.id))
    .coalesce(
      always(mergeLeft({ [stat]: 1 }, {avgRating:0})),
      compose(
        over(lensProp('count'), inc),
        over(lensProp(prop), inc)
      )
    )
    .chain(v => {
      console.log('setting: set(id,v)', {id, v})
      return set(id, v)
    })

}

function increment(id, prop) {
  //console.log('cache increment ', id, prop)
 
  return getFromCache(id)
    .coalesce(
      always(mergeLeft({ count: 1, [prop]: 1 }, {dislike:0, count:0, like:0})),
      compose(
        over(lensProp('count'), inc),
        over(lensProp(prop), inc)
      )
    )
    .chain(v => {
      console.log('setting: set(id,v)', {id, v})
      return set(id, v)
    })
}

function decrement(id, prop) {
  console.log('cache decrement ', id, prop)

  return getFromCache(id)
    .coalesce(
      always({ count: 1, [prop]: 1 }),
      compose(
        over(lensProp('count'), dec),
        over(lensProp(prop), dec)
      )
    )
    .chain(v => set(id, v))
}

function set(key, value) {
  console.log('set key/value to cache', key, value)


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

function removeFromCache(key) {
  console.log('services del (removeFromCache) ')
  return asyncFetch(hyper.url('cache', key), {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${hyper.token()}`
    }
  }).chain(toJSON)
}
