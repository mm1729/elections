var _state = {
  "name" : "",
  "house": false,
  "senate": false,
  "presidential": false,
  "year": [],
  "party": [],
  "states": [] // {abbr:"" , districts:[]}
}

var _data = {
  "house": [],
  "senate": [],
  "presidential": [],
  "parties": [], // all parties - name and abbr
  "states": [] // all states - name and abbr and districts - min to max
}

$(document).ready(function(){
  // get parties and states, districts
  $('#err').hide()
  initData();
  listenStates();
  listenDistricts();
  listenParties();
  listenYears();
  listenElectionType();
  $('button#submit').click(function(event) {
    event.preventDefault();
    $('#err').hide()
    var err = checkForm();
    if(err !== '') {
      var html = '<div class="alert alert-danger">' + err + '</div';
      $('#err').html(html)
      $('#err').show()
    } else {
      submit();
      removeAllDistricts();
      $("form")[0].reset();
    }
  })
});

function initData() {
  // get state data
  $.ajax({
    type: "GET",
    url: "/state"
  })
  .done(function(res) {
    _data.states = res.data
    updateFormView("states")
  })
  .fail(function(err) {
    console.log(err)
  })

  $.ajax({
    type: "GET",
    url: "/party"
  })
  .done(function(res) {
    _data.parties = res.data
    updateFormView("party")
  })
  .fail(function(err) {
    console.log(err)
  })
}

// updates view of page based on _data
function updateFormView(dataVar) {
  if(dataVar == "party") {
    var party_html = ""
    for(var i in _data.parties) {
      var party = _data.parties[i]
      party_html += "<option>" + party.abbr + " - " + party.name + "</option>";
    }
    $("#party").html(party_html)
  } else if(dataVar == "states") {
    var state_html = ""
    for(var i in _data.states) {
      var state = _data.states[i]
      state_html += "<option id='#" + state.abbr +"'>" + state.abbr + " - " + state.name + "</option>";
    }
    $("#state").html(state_html)
  }
}

// add or remove districts based on state selection
function listenStates() {
  $("#state").click(function(event) {
    var selectedStates = $("#state").val();
    for(var i in selectedStates) {
      selectedStates[i] = selectedStates[i].substring(0, 2);
    }

    var _states = []
    for(var s in _state.states) {
      _states.push(_state.states[s].abbr)
    }

    var newStates = selectedStates.filter(function(value) {
      return !_states.includes(value)
    });

    var remStates = _states.filter(function(value) {
      return !selectedStates.includes(value)
    })

    // push values needed
    Array.prototype.push.apply(_states, newStates)
    // delete removed values
    _states = _states.filter(function(value) {
      return !remStates.includes(value)
    })

    for(var i = 0; i < newStates.length; i++) {
      var st = newStates[i]
      if(!_state.states.includes(st)) {
        console.log("adding: " + st)
        _state.states.push({"abbr" : st, "districts": []})
      }
    }

    _state.states = _state.states.filter(function(value) {
      return !remStates.includes(value.abbr)
    })

    // remove remDistricts
    for(var i in remStates) {
      var state = remStates[i]
      console.log('removing' + state)
      $('div#'+state).remove()
    }

    // add newDistricts
    for(var i in newStates) {
      var state = newStates[i]
      var dhtml = '<div class="form-group" id="' + state + '">' +
        '<label for="district" class="col-sm-2 col-sm-offset-1 control-label"> ' + state + ' District</label> ' +'<div class="col-sm-6">' + '<select class="form-control" multiple>';
      var minMax = getMinMaxDistricts(state)
      var minDistrict = minMax[0]
      var maxDistrict = minMax[1]
      for(var j = parseInt(minDistrict); j <= parseInt(maxDistrict); j++) {
        var dname = ""+j
        if(dname.length < 2) dname = "0" + dname
        dhtml+= '<option>'+dname+'</option>'
      }
      dhtml+='</select> </div></div>'
      $('#districts').append(dhtml)
    }
    updateElectionView()
  })
}

function removeAllDistricts() {
  $('#districts').html('')
}


function getMinMaxDistricts(state) {
  var obj = _data.states.filter(function(st) {
    return st.abbr === state
  })[0]
  return [obj.min_district, obj.max_district]
}

function listenDistricts() {
  $('#districts').click(function(event) {
    if(_state.states.length === 0) return // no state, no district for you
    var state = event.target.parentNode.parentNode.parentNode.attributes.id.value
    if(state === 'districts') return // this is a click on outer div

    var selected = $('div#'+state+" select").val()
    for(var i = 0; i < _state.states.length; i++) {
      if(_state.states[i].abbr == state) {
        _state.states[i].districts = selected
      }
    }
  })
}

function listenParties() {
  $('#party').click(function(event) {
    var selectedParties = $("#party").val();
    _state.party = []
    for(var i in selectedParties) {
      _state.party.push(selectedParties[i].substring(0, selectedParties[i].indexOf('-') - 1))
    }
  })
}

function listenYears() {
  $('#year').click(function(event) {
    var yearObj = $("#year input:checked")
    var length = yearObj.length
    var arr = [];
    for(var i = 0; i < length; i++) {
      arr.push(yearObj[i].attributes.value.value)
    }
    _state.year = arr
    console.log(_state.party)
  })
}

function listenElectionType() {
  $('#electionType').click(function(event) {
    var elecType = $('#electionType input:checked')
    var length = elecType.length
    var arr = []
    for(var i = 0; i < length; i++) {
      arr.push(elecType[i].attributes.value.value)
    }
    _state.house = false
    _state.senate = false
    _state.presidential = false
    if(arr.includes("houseElection")) {
      _state.house = true
    }
    if(arr.includes("senateElection")) {
      _state.senate = true
    }
    if(arr.includes("presidentialElection")) {
      _state.presidential = true
    }
    updateElectionView();
  })
}

function updateElectionView() {
  if(_state.house === false) {
    $('#districts').hide()
  } else {
    $('#districts').show()
  }
}

function checkForm() {
  var msg = ""
  console.log(_state)
  if(_state.house === false && _state.senate === false && _state.presidential === false) {
    msg = "Please select an election type."
  } else if(_state.year.length === 0) {
    msg += " Please select atleast an year."
  } else if(_state.party.length === 0) {
    msg += " Please select atleast one party."
  }
  return msg
}

function submit() {
  console.log(JSON.stringify(_state))
  $.ajax({
    type: "GET",
    url: "/searchReq",
    data: encodeURIComponent(JSON.stringify(_state))
  })
  .done(function(res) {
    data = res.data
    processData(data)
  })
  .fail(function(err) {
    console.log(err)
  })

}

function processData(data) {
  _data.house = []
  _data.senate = []
  _data.presidential = []
  for(var i in data) {
    var obj = data[i]
    if(obj.district == 'SS') {
      _data.senate.push(obj)
    } else if(obj.district == 'PR') {
      _data.presidential.push(obj)
    } else {
      _data.house.push(obj)
    }
  }
  updateDataView();
}

function updateDataView() {
  var houseTableStub =   '<table class="table table-hover table-condensed"><thead><th>Name</th><th>Number of Votes</th><th>Percent of Votes</th><th>State</th><th>District</th><th>Year</th></thead><tbody>'
  var tableStub = '<table class="table table-hover table-condensed"><thead><th>Name</th><th>Number of Votes</th><th>Percent of Votes</th><th>State</th><th>Year</th></thead><tbody>'

  var houseHTML = ''
  if(_data.house.length > 0) {
    for(var i in _data.house) {
      var houseObj = _data.house[i]
      houseHTML += '<tr><td>' + houseObj.first_name + " " + houseObj.last_name + "</td><td>" + houseObj.num_votes + "</td><td>" + houseObj.per_votes * 100 + "</td><td>" + houseObj.state + "</td><td>" + houseObj.district + "</td><td>" + houseObj.year + "</td><td></tr>"
    }
    houseHTML = "<h3>House Results</h3>"+ houseTableStub + houseHTML + "</tbody></table>"
  }

  var senateHTML = ''
  if(_data.senate.length > 0) {
    for(var i in _data.senate) {
      var senateObj = _data.senate[i]
      senateHTML += '<tr><td>' + senateObj.first_name + " " + senateObj.last_name + "</td><td>" + senateObj.num_votes + "</td><td>" + senateObj.per_votes * 100 + "</td><td>" + senateObj.state + "</td><td>" + senateObj.year + "</td><td></tr>"
    }
    senateHTML = "<h3>Senate Results</h3>"+ tableStub + senateHTML + "</tbody></table>"
  }

  var presidentialHTML = ''
  if(_data.presidential.length > 0) {
    for(var i in _data.presidential) {
      var presidentialObj = _data.presidential[i]
      presidentialHTML += '<tr><td>' + presidentialObj.first_name + " " + presidentialObj.last_name + "</td><td>" + presidentialObj.num_votes + "</td><td>" + presidentialObj.per_votes * 100 + "</td><td>" + presidentialObj.state + "</td><td>" + presidentialObj.year + "</td><td></tr>"
    }
    presidentialHTML = "<h3>Presidential Results</h3>"+ tableStub + presidentialHTML + "</tbody></table>"
  }
  $('#dataTable').html(houseHTML+senateHTML+presidentialHTML)
}
