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

router.get('/searchReq', function(req, res) {
  var query = JSON.parse(decodeURIComponent(req._parsedOriginalUrl.query))
  console.log(query)
  //res.send('hello')
  if(query.name.length !== 0) {
    var comma = query.name.indexOf(',')
    var first_name = ''
    var last_name = ''
    if(comma == -1) {
      last_name = query.name
    } else {
      first_name = query.name.substring(comma+1)
      last_name = query.name.substring(0,comma)
    }

    db.getHistory(first_name, last_name, function(resp) {
      res.send(resp)
    })
  } else {
    db.filter(query.house, query.senate, query.presidential, query.year, query.party, query.states, function(resp){
      //console.log(resp)
      res.send(resp)
    })
  }
});

router.get('/president',function(req,res){
  res.sendFile('presidential.html',{'root': path.join(__dirname, '../public/html/')})
})

router.get('/senatestats',function(req,res){
  var query = req.query
  db.getSenateStatistic(query.party,query.state,query.input,function(resp){
    res.send(resp)
  })
})

router.get('/housestats',function(req,res){
  var query = req.query
  db.getHouseStatistic(query.party,query.state,query.input,function(resp){
    res.send(resp)
  })
})

router.get('/finances',function(req,res){
  var query = req.query
  db.getSpending(query.election,query.party,function(resp){
    res.send(resp)
  })
})

module.exports = router
