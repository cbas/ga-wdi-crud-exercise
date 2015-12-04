const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const jwt = require('express-jwt')

// connect to database
const dbuser = process.env.SCOREBOARD_DB_USER
const dbpassword = process.env.SCOREBOARD_DB_PASSWORD
const dburl = 'mongodb://' + dbuser + ':' + dbpassword + '@ds061954.mongolab.com:61954/scoreboard'
mongoose.connect(dburl)
const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error: '))

// define mongoose model (schema)
const Score = mongoose.model('Score', {
  player: String,
  score: Number
})

const app = express()
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/scores', jwt({
  secret: new Buffer(process.env.SCOREBOARD_AUTH0_SECRET, 'base64'),
  audience: process.env.SCOREBOARD_AUTH0_AUDIENCE
}))

app.get('/scores', (req, res) => {
  Score.model('Score').find((err, scores) => {
    if (err) {
      console.error(err)
      res.status(404).end(err)
      return
    }
    res.json(scores)
  })
})

// create
app.post('/scores', (req, res) => {
  const score = new Score(req.body)
  score.save(err => {
    if (err) return console.error(err)
    console.log('New score added.')
    res.redirect('/')
  })
})

// update
app.put('/scores/', (req, res) => {
  var query = { player: req.body.player }
  Score.findOneAndUpdate(query, req.body, { new: true }, (err, score) => {
    if (err) {
      console.error(err)
      res.status(500).end(err)
    } else if (score) {
      console.log('Player updated', JSON.stringify(score))
      res.json(score)
    } else {
      console.warn('Not found')
      res.status(404).end('Not found')
    }
  })
})

// delete
app.delete('/scores/', (req, res) => {
  // console.log(req.body)
  var query = { player: req.body.player }
  Score.findOneAndRemove(query, (err, score) => {
    if (err) {
      console.error(err)
      res.status(500).end(err)
    } else if (score) {
      console.log('Player deleted', JSON.stringify(score))
      res.json(score)
    } else {
      console.warn('Not found')
      res.status(404).end('Not found')
    }
  })
})

module.exports = app
