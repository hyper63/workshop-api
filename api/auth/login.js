const github = 'https://github.com/login/oauth/authorize'
const clientId = process.env.CLIENT_ID

module.exports = (req, res) => {
  console.log('workshop-api api/auth/login.js clientId: ', clientId)
  console.log('workshop-api api/auth/login.js res.redirect url: ', `${github}?client_id=${clientId}&state=${req.session.id}`)

  res.redirect(`${github}?client_id=${clientId}&state=${req.session.id}`)

  res.redirect()
}
