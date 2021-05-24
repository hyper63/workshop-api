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

const criteriaSchema = z.object({
  title: z.string().optional(),
  year: z.string().optional(),
  genre: z.enum(['action', 'comedy', 'horror', 'scifi', 'drama', 'romance']).optional()
})

function validate (movie) {
  return Async.of(movie)
  .map(schema.safeParse)
  .map(({success, data, error}) =>  success 
    ? Right(data) 
    : Left(formatErrors(error))
  ).chain(eitherToAsync)
} 

function validateCriteria (criteria) {
  return Async.of(criteria)
    .map(criteriaSchema.safeParse)
    .map(({success, data, error}) => success
      ? Right(data)
      : Left(formatErrors(error))
    ).chain(eitherToAsync)
}

module.exports = {
  validate,
  validateCriteria
}
