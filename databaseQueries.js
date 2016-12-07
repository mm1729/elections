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

    var query = 'SELECT * from state_district'

    connection.query(query, function(err, rows, fields) {
      connection.release()
      if(!err) {
        var data = []
        for(i in rows) {
          data.push(rows[i])
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

db.getParty = function(next) {
  pool.getConnection(function(err, connection) {
    if(err) {
      next({'err' : err});
    }

    var query = 'SELECT * from relations_party'

    connection.query(query, function(err, rows, fields) {
      connection.release()
      if(!err) {
        var data = []
        for(i in rows) {
          data.push(rows[i])
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

function getStateDistrictStub(states, electionType) {
  var stateStub = ''
  if(electionType === 'house') {
    for(var i in states) {
      state = states[i].abbr
      stateStub += "(state = '" + state + "' and ("
      var districts = states[i].districts
      for(var i in districts) {
        stateStub += "district = '" + districts[i] + "' or "
      }
      if(districts.length === 0) { // backtrack " and ("
        stateStub = stateStub.substring(0, stateStub.length - 6)
      } else { // backtract " or "
        stateStub = stateStub.substring(0, stateStub.length - 4)
        stateStub += ')'
      }
      stateStub += ') or '
    }
    stateStub = stateStub.substring(0, stateStub.length - 4)// backtrack " or "
  } else if(electionType === 'senate') {
    for(var i in states) {
      state = states[i].abbr
      stateStub += "(state = '" + state + "' and district = 'SS') or "
    }
    stateStub = stateStub.substring(0, stateStub.length - 4) // backtrack " or "
  } else if(electionType === 'presidential') { // presidential
    for(var i in states) {
      state = states[i].abbr
      stateStub += "(state = '" + state + "' and district = 'PR') or "
    }
    stateStub = stateStub.substring(0, stateStub.length - 4) // backtrack " or "
  }
  return stateStub
}

db.filter = function(house, senate, presidential, years, parties, states, next){
  pool.getConnection(function(err, connection) {
    console.log(states)
    if(err) {
      next({'err' : err});
    }

    var yearStub = '('
    for(var i in years) {
      yearStub += 'year = ' + years[i] + ' or '
    }
    yearStub = yearStub.substring(0, yearStub.length - 4)//backtrack ' or '
    yearStub += ')'

    var partyStub = '('
    for(var j in parties) {
      partyStub += "party = '" + parties[j] + "' or "
    }
    partyStub = partyStub.substring(0, partyStub.length - 4)//backtrack ' or '
    partyStub += ')'

    var stub = "select * from mega_table where "

    var stateStub = '('
    if(states.length > 0) { // states
      if(house == true) {
        console.log('here3')
        stateStub += getStateDistrictStub(states, 'house')
      }
      if(senate == true) {
        stateStub += (stateStub.length === 1) ?
         getStateDistrictStub(states, 'senate') : ' or ' + getStateDistrictStub(states, 'senate')
      }
      if(presidential == true) {
        stateStub += (stateStub.length === 1) ?
         getStateDistrictStub(states, 'presidential') : ' or ' + getStateDistrictStub(states, 'presidential')
      }
    } else {
      console.log('here2')
      if(house == true) {
        stateStub += "(district <> 'PR' and district <> 'SS') or "
      }
      if(senate == true) {
        stateStub += "district = 'SS' or "
      }
      if(presidential == true) {
        stateStub += "district = 'PR' or "
      }
      stateStub = stateStub.substring(0, stateStub.length - 4) // backtrack " or "
    }
    stub += stateStub + ") and "

    if(parties.length !== 0) {
      stub +=  partyStub + " and "
    }
    if(years.length !== 0) {
      stub +=  yearStub + " and "
    }
    stub = stub.substring(0, stub.length - 5) // backtrack " and "
    console.log(stub)

    connection.query(stub, function(err, rows, fields) {
      connection.release()
      if(!err) {
        next({'data': rows})
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

db.getSpending = function(election,party,next){
	pool.getConnection(function(err,connection){
		if(err){
			next({'err':err})
		}
		var query = "Select mean_expenditure from relations_spending where election="+mysql.escape(election)
				+"and party="+mysql.escape(party)
		console.log(query)
		connection.query(query,function(err,rows,fields){
			connection.release()
			if(!err){
				var sum = 0
				var count = 0
				for(i in rows){
					var row = rows[i]
					sum+=row.mean_expenditure
					count+=1

				}
				next({'expenses' : sum/count})

			}
			else{
				next({'err':err})
			}
		})
		connection.on('on',function(err){
			next({'err':err})
		})
	})
}

db.getHouseStatistic = function(party,state,input,next){

	pool.getConnection(function(err,connection){
		if(err){
			next({'err':err});
		}
		var query = "Select y,n,avg_ab from relations_house_stat where party="+ mysql.escape(party) +"and state="+mysql.escape(state);
		console.log(query)
		connection.query(query,function(err,rows,fields){
			connection.release()
			if(!err){
				for(i in rows){
					var row = rows[i]

					var y = row.y
					var n = row.n
					var avgab = row.avg_ab

					var avg1 = (2/3)*avgab+input/3
					var win_score =(y-n+avg1)/(y+n+avg1)
					var lose_score= (y-n-avg1)/(y+n+avg1)

					if(Math.abs(lose_score-avgab) > Math.abs(win_score-avgab)){
						next({'score': win_score})
					}
					else{
						next({'score': lose_score})
					}


				}
			}
			else{
				next({'err':err})
			}
		})
		connection.on('on',function(err){
			next({'err':err})
		})
	})

}


db.getSenateStatistic = function(party,state,input,next){
	pool.getConnection(function(err,connection){
		if(err){
			next({'err':err});
		}
		var query = "Select avgfg,avgxy from relations_senate_stat where party=" +mysql.escape(party) +"and state="+mysql.escape(state);
		console.log(query)
		connection.query(query,function(err,rows,fields){
			connection.release()
			if(!err){
				for(i in rows){
					var row = rows[i]
					var avgfg = row.avgfg
					var avgxy = row.avgxy
					var avg1 = (avgfg+input)/2
					var p = Math.abs((avgfg-input)/2)
					if(input <avgfg){
						p = -1*p
					}
					var ans_pres = avgxy +p
					next({'score':ans_pres})
				}
			}
			else{
				next({'err':err})
			}
		})
		connection.on('on',function(err){
			next({'err':err})
		})

	})

}

module.exports = db
