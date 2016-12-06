var mysql = require('mysql')
var db = {}
var pool = mysql.createPool({
  connectionLimit: 100,
  host: 'electiondb.ch5xrhykezn3.us-east-1.rds.amazonaws.com',
  user: 'election',
  password: 'election',
  database: 'electiondb'
})

function runQuery(executeFunc, args) {
  pool.getConnection(function(err, connection) {
    console.log('here3')
    if(err) {
      console.log(err)
      return {'err' : err};
    }
    executeFunc(connection, args)

    connection.on('error', function(err) {
      console.log(err)
      retir
    })
  });
}


db.getStates = function(next) {
  pool.getConnection(function(err, connection) {
    if(err) {
      next({'err' : err});
    }

    var query = 'SELECT * from relations_state'

    connection.query(query, function(err, rows, fields) {
      connection.release()
      if(!err) {
        var data = []
        for(i in rows) {
          data.push(row[i])
        }
        next({'data': data})
      } else {
        next({'err': err})
      }
    })

    connection.on('error', function(err) {
      next({'err': err})
    })
  })
}

db.getYearResults = function(electionType, year, next) {
  pool.getConnection(function(err, connection) {
    if(err) {
      next({'err' : err});
    }

    var district = (electionType === 'senate') ? " district = 'SS'" : " district = 'PR'"
    if(electionType == 'house') {
      district = " district <> 'PR' and district <> 'SS'"
    }
    var query = 'SELECT candidate_id, state, party FROM winners WHERE' + district + " and year = " + mysql.escape(year) + " group by candidate_id, state";

    connection.query(query, function(err, rows, fields) {
      connection.release()
      if(!err) {
        var data = {}
        for(i in rows) {
          var row = rows[i]
          if(row.state in data) {
            data[row.state].push(row.party)
          } else {
            data[row.state] = [row.party]
          }
        }
        next({'data': data})
      } else {
        next({'err': err})
      }
    })

    connection.on('error', function(err) {
      next({'err': err})
    })
  })
}

db.getStateYearResults = function(electionType, year, state, next) {
  pool.getConnection(function(err, connection) {
    if(err) {
      next({'err' : err});
    }

    var district = (electionType === 'senate') ? " district = 'SS'" : " district = 'PR'"
    if(electionType === 'house') {
      district = " district <> 'PR' and district <> 'SS'"
    }
    var query = "SELECT a.first_name, a.last_name, b.per_votes, b.incumbent, c.party FROM relations_candidate as a, (select candidate_id, per_votes, incumbent, year from relations_contested WHERE " + district + " and year = " + mysql.escape(year) + " and state = " + mysql.escape(state) + ") as b, relations_affl as c where a.id = b.candidate_id and a.id = c.candidate_id and c.year = b.year";
    console.log(query)
    connection.query(query, function(err, rows, fields) {
      connection.release()
      if(!err) {
        var data = {}
        for(i in rows) {
          var row = rows[i]
          var name = row.first_name + " " + row.last_name
          data[name] = {
            "per_votes" : row.per_votes,
            "incumbent" : row.incumbent,
            "party" : row.party
          }
        }
        console.log(data)
        next({'data': data})
      } else {
        console.log(err)
        next({'err': err})
      }
    })

    connection.on('error', function(err) {
      next({'err': err})
    })
  })
}

module.exports = db
