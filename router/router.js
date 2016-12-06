var express = require('express')
var path = require('path')
var router = express.Router()
var db = require('../databaseQueries')

router.get('/', function(req, res) {
  //db.getStates()
  res.sendFile('index.html', {'root' : path.join(__dirname, '../public/html/')})
})

router.get('/search', function(req, res) {
  res.sendFile('searchData.html', {'root' : path.join(__dirname, '../public/html/')})

})

router.get('/state', function(req, res) {
  db.getStates(function(resp) {
    res.send(resp)
  })
})

router.get('/party', function(req, res) {
  db.getParty(function(resp) {
    res.send(resp)
  })
})

router.get('/mapdata', function(req, res) {
  var query = req.query
  db.getYearResults(query.election_type, query.year, function(resp) {
    res.send(resp)
  })

});

router.get('/mapdataSpecific', function(req, res) {
  var query = req.query
  db.getStateYearResults(query.election_type, query.year, query.state, function(resp) {
    res.send(resp)
  })
});

module.exports = router
