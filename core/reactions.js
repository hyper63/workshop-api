module.exports = (services) => {
  function byReview(id) {
    return services.data.query({
      type: 'reaction',
      reviewId: id
    })
  }

  return {
    byReview
  }
}
