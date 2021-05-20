const github = 'https://github.com/login/oauth/authorize'
const clientId = process.env.CLIENT_ID


module.exports = (req, res) => {
  res.redirect(`${github}?client_id=${clientId}&state=${req.session.id}`)
}
