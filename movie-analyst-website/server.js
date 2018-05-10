// Declare our dependencies
const express = require('express')
const exphbs = require('express-handlebars')
const request = require('superagent')
const path = require('path')

// Create our express app
const app = express()

const hbs = exphbs.create({
  defaultLayout: 'main',
  extname: '.hbs',
  partialsDir: 'views/partials/'
})

// Register `hbs` as our view engine using its bound `engine()` function.
app.engine('.hbs', hbs.engine)

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', '.hbs')

app.use(express.json())

// This tells Express out of which directory to serve static assets like CSS and images
app.use(express.static(__dirname + '/public'))

// These two variables we’ll get from our Auth0 MovieAnalyst-Website Client.
// Head over the the management dashboard at https://manage.auth0.com
// Find the MovieAnalyst Website Client and copy and paste the Client ID and Secret
const NON_INTERACTIVE_CLIENT_ID = 'Gwtl07SofXeC2spTj5wOZ0dyE66BXTUB'
const NON_INTERACTIVE_CLIENT_SECRET = '0uorO3TvZaMmm1mQsN96BQOR0q-JItDwUoRRJOY75BmOxdSvxG6p4qXdIgjggEX6'

// Next, we’ll define an object that we’ll use to exchange our credentials for an access token.
const authData = {
  client_id: NON_INTERACTIVE_CLIENT_ID,
  client_secret: NON_INTERACTIVE_CLIENT_SECRET,
  grant_type: 'client_credentials',
  audience: 'https://movieanalyst.com'
}

// Middleware to make a request to the oauth/token Auth0 API with our authData we created earlier.
// Data will be validated and if everything is correct, we’ll get back an access token.
// Store this token in the req.access_token variable and continue the request execution.
// It may be repetitive to call this endpoint each time and not very performant, so you can cache the access_token once it is received.
function getAccessToken(req, res, next) {
  request
    .post('https://philosec.auth0.com/oauth/token')
    .send(authData)
    .end(function(err, _res) {
      if (req.body.access_token) {
        req.access_token = res.body.access_token
        next()
      } else {
        res.send(401, 'Unauthorized')
      }
    })
}

// The homepage route of our application does not interface with the MovieAnalyst API and is always accessible. We won’t use the getAccessToken middleware here. We’ll simply render the index.ejs view.
app.get('/', function(req, res) {
  res.render('index')
})

// For the movies route, we’ll call the getAccessToken middleware to ensure we have an access token. If we do have a valid access_token, we’ll make a request with the superagent library and we’ll be sure to add our access_token in an Authorization header before making the request to our API.
// Once the request is sent out, our API will validate that the access_token has the right scope to request the /movies resource and if it does, will return the movie data. We’ll take this movie data, and pass it alongside our movies.ejs template for rendering
app.get('/movies', getAccessToken, function(req, res) {
  request
    .get('http://localhost:3000/movies')
    .set('Authorization', 'Bearer ' + req.access_token)
    .end(function(err, data) {
      if (data.status == 403) {
        res.send(403, '403 Forbidden')
      } else {
        var movies = data.body
        res.render('movies', { movies: movies })
      }
    })
})

// The process will be the same for the remaining routes. We’ll make sure to get the acess_token first and then make the request to our API to get the data.
// The key difference on the authors route, is that for our client, we’re naming the route /authors, but our API endpoint is /reviewers. Our route on the client does not have to match the API endpoint route.
app.get('/authors', getAccessToken, function(req, res) {
  request
    .get('http://localhost:3000/reviewers')
    .set('Authorization', 'Bearer ' + req.access_token)
    .end(function(err, data) {
      if (data.status == 403) {
        res.send(403, '403 Forbidden')
      } else {
        var authors = data.body
        res.render('authors', { authors: authors })
      }
    })
})

app.get('/publications', getAccessToken, function(req, res) {
  request
    .get('http://localhost:3000/publications')
    .set('Authorization', 'Bearer ' + req.access_token)
    .end(function(err, data) {
      if (data.status == 403) {
        res.send(403, '403 Forbidden')
      } else {
        var publications = data.body
        res.render('publications', { publications: publications })
      }
    })
})

// We’ve added the pending route, but calling this route from the MovieAnalyst Website will always result in a 403 Forbidden error as this client does not have the admin scope required to get the data.
app.get('/pending', getAccessToken, function(req, res) {
  request
    .get('http://localhost:3000/pending')
    .set('Authorization', 'Bearer ' + req.access_token)
    .end(function(err, data) {
      if (data.status == 403) {
        res.send(403, '403 Forbidden')
      }
    })
})

app.listen(8080)
