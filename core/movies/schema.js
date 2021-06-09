const { Async, Either, eitherToAsync } = require('crocks')
const { Left, Right } = Either
const z = require('zod')
const formatErrors = require('../lib/format-errors')

const schema = z.object({
  id: z.string(),
  title: z.string(),
  year: z.string(),
  actors: z.array(z.string()),
  genre: z.enum(['action', 'comedy', 'horror', 'scifi', 'drama', 'romance']),
  summary: z.string().optional(),
  bannerURL: z.string().optional(),
  avgRating: z.number().min(0).max(5).optional(),
  stars: z.number().int().min(0).max(5).optional()
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

function validateAlreadyExists (movie) {
  return Async.of(movie)
  .map(schema.safeParse)
  .map(({success, data, error}) =>  success 
    ? Left({
      status: 400,
      message: 'movie already exists'
    })
    : Right({ok: true}) 
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
  validateCriteria,
  validateAlreadyExists
}
