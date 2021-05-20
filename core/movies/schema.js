const { Async, Either, eitherToAsync } = require('crocks')
const { Left, Right } = Either
const z = require('zod')
const formatErrors = require('../lib/format-errors')

const schema = z.object({
  id: z.string(),
  title: z.string(),
  year: z.string(),
  actors: z.array(z.string()),
  genre: z.enum(['action', 'comedy', 'horror', 'scifi', 'drama', 'romance'])
})

// validate
module.exports = movie => 
  Async.of(movie)
    .map(schema.safeParse)
    .map(({success, data, error}) =>  success 
      ? Right(data) 
      : Left(formatErrors(error))
    ).chain(eitherToAsync)

