const express = require('express')
const request = require('superagent')

const app = express()

app.set('view engine', 'ejs')
app.set('views', __dirname + '/public/views/')

app.use(express.static(__dirname + '/public'))

const NON_INTERACTIVE_CLIENT_ID = 'RKi7FMx8NWRB0XRkMjvNm13SyJw3SVpg'
const NON_INTERACTIVE_CLIENT_SECRET = 'FymPjekfl6bQb2NIRh3i5LUsr-2mqMfGMTaLxLB33ZV0ttEBUzF0t6SavxT9w0jc'

const authData = {
  client_id: NON_INTERACTIVE_CLIENT_ID,
  client_secret: NON_INTERACTIVE_CLIENT_SECRET,
  grant_type: 'client_credentials',
  audience: 'http://movieanalyst.com'
}
app.use(getAccessToken)

// First, authenticate this client and get an access_token
// This could be cached
function getAccessToken(req, res, next){
  request
    .post('https://philosec.auth0.com/oauth/token')
    .send(authData)
    .end(function(err, res) {
      req.access_token = res.body.access_token
      next()
    })
}

app.get('/', function(req, res){
  res.render('index')
})

app.get('/movies', getAccessToken, function(req, res){
  request
    .get('http://localhost:8080/movies')
    .set('Authorization', 'Bearer ' + req.access_token)
    .end(function(err, data) {
      if(data.status == 403){
        res.send(403, '403 Forbidden')
      } else {
        const movies = data.body
        res.render('movies', { movies: movies} )
      }
    })
})

app.get('/authors', getAccessToken, function(req, res){
  request
    .get('http://localhost:8080/reviewers')
    .set('Authorization', 'Bearer ' + req.access_token)
    .end(function(err, data) {
      if(data.status == 403){
        res.send(403, '403 Forbidden')
      } else {
        const authors = data.body
        res.render('authors', {authors : authors})
      }
    })
})

app.get('/publications', getAccessToken, function(req, res){
  request
    .get('http://localhost:8080/publications')
    .set('Authorization', 'Bearer ' + req.access_token)
    .end(function(err, data) {
      if(data.status == 403){
        res.send(403, '403 Forbidden')
      } else {
        const publications = data.body
        res.render('publications', {publications : publications})
      }
    })
})

app.get('/pending', getAccessToken, function(req, res){
  request
    .get('http://localhost:8080/pending')
    .set('Authorization', 'Bearer ' + req.access_token)
    .end(function(err, data) {
      if(data.status == 403){
        res.send(403, '403 Forbidden')
      } else {
        const movies = data.body
        res.render('pending', {movies : movies})
      }
    })
})

app.listen(4000)