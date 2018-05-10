// Setup dependancies
//====================================
const express = require('express')
const app = express()
const jwt = require('express-jwt')
const rsaValidation = require('auth0-api-jwt-rsa-validation')

// API endpoints
//========================================
require('./app/routes/api-routes')(app)

app.listen(3000)