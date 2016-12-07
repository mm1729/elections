var _state = {
  "name" : "",
  "house": false,
  "senate": false,
  "presidential": false,
  "year": [],
  "party": [],
  "states": {} // {abbr:"" , districts:[]}
}

var _data = {
  "house": {},
  "senate": {},
  "presidential": {},
  "parties": [], // all parties - name and abbr
  "states": [] // all states - name and abbr and districts - min to max
}

$(document).ready(function(){
  // get parties and states, districts
  initData();
  listenStates();
  listenDistricts();
  listenParties();
  listenYears();
  listenElectionType();
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

    var _states = Object.keys(_state.states)
    console.log(_states)
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

    for(var s in remStates) {
      delete _state.states[remStates[s]]
    }

    var preStates = Object.keys(_state.states)
    for(var s in _states) {
      var st = _states[s]
      if(!preStates.includes(st)) {
        console.log(st)
        _state.states[st] = []
      }
    }

    // remove remDistricts
    for(var i in remStates) {
      var state = remStates[i]
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
  })
}


function getMinMaxDistricts(state) {
  var obj = _data.states.filter(function(st) {
    return st.abbr === state
  })[0]
  console.log(obj)
  return [obj.min_district, obj.max_district]
}

function listenDistricts() {
  $('#districts').click(function(event) {
    if(_state.states.length === 0) return // no state, no district for you
    var state = event.target.parentNode.parentNode.parentNode.attributes.id.value
    if(state === 'districts') return // this is a click on outer div

    var selected = $('div#'+state+" select").val()
    var _states = Object.keys(_state.states)
    var arr = _states.filter(function(value) {
      console.log(value)
      return value === state
    })
    if(arr.length === 0) { // does not exist in states
      console.log('no state')
    } else {
      _state.states[arr[0]] = selected
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
    _state.party = arr
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
    console.log(_state)
  })
}
