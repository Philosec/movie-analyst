// Setup dependancies
//====================================
const express = require('express')
const app = express()
const jwt = require('express-jwt')
const rsaValidation = require('auth0-api-jwt-rsa-validation')

// Middleware to validate access token when our API is called
//========================================
const jwtCheck = jwt({
  secret: rsaValidation(),
  algorithms: ['RS256'],
  issuer: 'https://philosec.auth0.com/',
  audience: 'https://movieanalyst.com'
})

const guard = function(req, res, next) {
  // we’ll use a case switch statement on the route requested
  switch (req.path) {
    // if the request is for movie reviews we’ll check to see if the token has general scope
    case '/movies': {
      const permissions = ['general']
      for (var i = 0; i < permissions.length; i++) {
        if (req.user.scope.includes(permissions[i])) {
          next()
        } else {
          res.send(403, { message: 'Forbidden' })
        }
      }
      break
    }
    // Same for the reviewers
    case '/reviewers': {
      const permissions = ['general']
      for (var i = 0; i < permissions.length; i++) {
        if (req.user.scope.includes(permissions[i])) {
          next()
        } else {
          res.send(403, { message: 'Forbidden' })
        }
      }
      break
    }
    // Same for publications
    case '/publications': {
      const permissions = ['general']
      for (var i = 0; i < permissions.length; i++) {
        if (req.user.scope.includes(permissions[i])) {
          next()
        } else {
          res.send(403, { message: 'Forbidden' })
        }
      }
      break
    }
    // For the pending route, we’ll check to make sure the token has the scope of admin before returning the results.
    case '/pending': {
      const permissions = ['admin']
      console.log(req.user.scope)
      for (var i = 0; i < permissions.length; i++) {
        if (req.user.scope.includes(permissions[i])) {
          next()
        } else {
          res.send(403, { message: 'Forbidden' })
        }
      }
      break
    }
  }
}

app.use(jwtCheck)

app.use(function(err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({ message: 'Missing or invalid token' })
  }
})

app.use(guard)

// API endpoints
//========================================
require('./app/routes/api-routes')(app)

app.listen(3000)
