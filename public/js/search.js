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
  "house": {},
  "senate": {},
  "presidential": {},
  "parties": [], // all parties - name and abbr
  "states": [] // all states - name and abbr and districts - min to max
}

$(document).ready(function(){
  // get parties and states, districts
  initData();
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
$("#state").click(function(event) {
  var selectedStates = $("#state").val();
  for(var i in selectedStates) {
    selectedStates[i] = selectedStates[i].substring(0, 2);
  }
  var newStates = selectedStates.filter(function(value) {
    return !_state.states.includes(value)
  });

  var remStates = _state.states.filter(function(value) {
    return !selectedStates.includes(value)
  })
  // push values needed
  Array.prototype.push.apply(_state.states, newStates)
  // delete removed values
  _state.states = _state.states.filter(function(value) {
    return !remStates.includes(value)
  })

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
    console.log(minDistrict, maxDistrict)
    for(var j = parseInt(minDistrict); j <= parseInt(maxDistrict); j++) {
      var dname = ""+j
      if(dname.length < 2) dname = "0" + dname
      dhtml+= '<option>'+dname+'</option>'
    }
    dhtml+='</select> </div></div>'
    $('#districts').append(dhtml)
  }
  console.log(newStates)
  console.log(_state.states)
  console.log(remStates)
})

function getMinMaxDistricts(state) {
  var obj = _data.states.filter(function(st) {
    return st.abbr === state
  })[0]
  console.log(obj)
  return [obj.min_district, obj.max_district]
}
