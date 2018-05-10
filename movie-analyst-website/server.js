// Declare our dependencies
const express = require('express')
const exphbs = require('express-handlebars')
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

require('./routes/view-routes')(app)

app.listen(8080)