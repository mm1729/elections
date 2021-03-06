data = {
  "house" : {},
  "senate" : {},
  "presidential" : {}
};

var houseMap;
var senateMap;
var presidentialMap;

$(document).ready(
function() {
  initData();
  setData();
  var defaultYear = 2006;
  var presidentialDefaultYear = 2008;
  houseMap = createMap('house', defaultYear);
  senateMap = createMap('senate', defaultYear);
  presidentialMap = createMap('presidential', presidentialDefaultYear);

  $('ul.yearSelector>li').click(function(event) {
    var mapType = $(this).closest('ul.yearSelector').attr('id').substring(3);
    var year = $(this).text();
    console.log(mapType + " " + year)
    updateMap(mapType, year);
  });
}
)

function updateMap(mapType, year) {
  //console.log(data);
  if(mapType == 'house') {
    console.log('updating to : ')
    console.log(data.house)
    houseMap.updateChoropleth(data.house[year]);
  } else if(mapType == 'senate') {
    senateMap.updateChoropleth(data.senate[year]);
  } else if(mapType == 'presidential') {
    presidentialMap.updateChoropleth(data.presidential[year]);
  } else {
    console.log('Error with selecting maptype');
  }
}

function createMap(type, year) {
  var map = new Datamap(getDataMapInput(type, data.house[year]));
  map.labels();
  return map;
}

function setData() {
  for (var key in data) {
    if (data.hasOwnProperty(key)) {
      var allYearsData = {};
      if(key == "house" || key == "senate") {
        getDataFromServer(2006, key);
        getDataFromServer(2010, key);
        getDataFromServer(2014, key);
      }
      getDataFromServer(2008, key);
      getDataFromServer(2012, key);
    }
  }

}

function initData() {
  var states = ['AK', 'AL', 'AR', 'AZ', 'CA', 'CO', 'CT', 'DC', 'DE', 'FL', 'GA', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'MA', 'MD', 'ME', 'MI', 'MN', 'MO', 'MS', 'MT', 'NC', 'ND', 'NE', 'NH', 'NJ', 'NM', 'NV', 'NY', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VA', 'VT', 'WA', 'WI', 'WV', 'WY'];

  var legendData = {};
  for(state in states){
    legendData[states[state]] = {
      "fillKey" : "No Election",
      "party":  "None"
    };
  }

  for (var key in data) {
    if (data.hasOwnProperty(key)) {
      var allYearsData = {};
      if(key == "house" || key == "senate") {
        allYearsData["2006"] = jQuery.extend(true, {}, legendData);
        allYearsData["2010"] = jQuery.extend(true, {}, legendData);
        allYearsData["2014"] = jQuery.extend(true, {}, legendData);
      }
      allYearsData["2008"] = jQuery.extend(true, {}, legendData);
      allYearsData["2012"] = jQuery.extend(true, {}, legendData);

      data[key] = allYearsData;

    }
  }
}

function getDataFromServer(year, electionType) {
  $.ajax({
    method: "GET",
    url: "/mapdata",
    data: {"year" : year, "election_type": electionType},
    cache: true,
  })
  .done(function(res) {
    //console.log(data.house['2006']['AK']);
    var legendData = {};
    var sdata = res.data;
    //console.log(year + " " + electionType)
    //console.log(sdata)
    /*console.log("------------------------------------------")
    console.log("num states: " + Object.keys(sdata).length)
    if(year == 2006 && electionType == 'house') {
      console.log("pre: ");
      console.log(data['house']['2006']);

      var none_party = 0;
      for(var i in data[electionType][year]) {
        console.log(i+ " " +data[electionType][year][i].party);
        if(data[electionType][year][i].party == "None") {
          none_party++;
        }
      }
      console.log(none_party);
    }*/
    console.log(data)
    for(var i in sdata) {
      var state = i;
      var demCount = 0;
      var repCount = 0;
      var others = 0;
      for(var j in sdata[i]) {
        var party = sdata[i][j];
        //console.log(j + " " + party)
        if(party === 'D' || party === 'DEM' || party === 'DFL' || party == 'DNL') {
          demCount++;
        } else if(party === 'R' || party === 'CON' || party === 'REP' || party === 'GOP') {
          repCount++;
        } else {
          others++;
        }
      }

      //var demToRep = Math.round((demCount)*100.0/repCount) / 100;
      var demToRep = (demCount-repCount)/(demCount+repCount)
      var designation = 'Others';
      if(demToRep < -0.75) {
        designation = 'Heavy Republican'
      } else if(demToRep < -0.25) {
        designation = 'Republican'
      } else if(demToRep < 0) {
        designation = 'Light Republican'
      } else if(demToRep == 0) {
        designation = 'Mixed';
      } else if(demToRep < 0.25) {
        designation = 'Light Democrat';
      } else if(demToRep < 0.75) {
        designation = 'Democrat';
      } else {
        designation = 'Heavy Democrat';
      }

      if(others > demCount && others > repCount) {
        designation = 'Other';
      }

      //console.log(electionType + "  " + year)
      if(data[electionType][year][state]) {
        data[electionType][year][state]["fillKey"] = designation
        data[electionType][year][state]["party"] = designation
      }

      /*data[electionType][year][state] = {
        "fillKey" : designation,
        "party":  designation
      };*/
      //console.log(data[electionType][year][state])
      /*console.log(data['house'][year][state])
      console.log(data['senate'][year][state])
      console.log(data['presidential'][year][state])*/
    }
    if(electionType == 'house' && year == 2008) {
      console.log("house: ")
      console.log(data[electionType][year])
    }
    if(electionType == 'presidential' && year == 2008) {
      console.log("presidential: ")
      console.log(data[electionType][year])
    }
    //console.log(data[electionType][2006])
    //console.log(data[electionType][2008])
    //data[electionType][year] = legendData;
    /*var none_party = 0;
    for(var i in data[electionType][year]) {
      console.log(i+ " " +data[electionType][year][i].party);
      if(data[electionType][year][i].party == "None") {
        none_party++;
      }
    }
    console.log(none_party);
    console.log("election Type: " + electionType, " year: " + year);
    //console.log("num data states: " + Object.keys(legendData).length)
    if(year == 2006 && electionType == 'house') {
      console.log("post: ");
      console.log(data['house'][2006]);
    }*/
    updateMap(electionType, year);
    //updateMap('house', 2006); // set it to default back
    //updateMap('senate', 2006);
    //updateMap('presidential', 2008);
    //console.log(legendData);
    return legendData;
  })
  .fail(function(err) {
    console.log("Error:");
    console.log(err);
  })
}

function getDataMapInput(elementId, legendData) {
  return {
    scope: 'usa',
    element: document.getElementById(elementId),
    geographyConfig: {
            highlightBorderColor: '#bada55',
           popupTemplate: function(geography, data) {
                     return '<div class="hoverinfo">' + geography.properties.name +
                   ' Party: ' +  data.party + ' '
                   },
            highlightBorderWidth: 3
          },

    fills: {
          'Heavy Republican': '#CC4731',
          'Heavy Democrat': '#306596',
          'Democrat': '#667FAF',
          'Light Democrat': '#A9C0DE',
          'Republican': '#CA5E5B',
          'Light Republican': '#EAA9A8',
          'Mixed': '#FFFFFF',
          'Other': '#EDDC4E',
          'No Election': '#000000',
          defaultFill: '#000000'
    },
    data: legendData,
    done: function(datamap) {mapHandler(datamap);}
  }
}

function modalData(state, year, electionType) {
  $.ajax({
    method: "GET",
    url: "/mapdataSpecific",
    data: {"year" : year, "election_type": electionType, "state": state},
    cache: true
  })
  .done(function(res) {
    var data = res.data;
    var modalhtml = "<table class='table table-hover table-condensed'><thead><th>Name</th><th>Party</th><th>Percent Won</th><tbody>";
    for (i in data) {
      modalhtml+= "<tr><td>" + i + "</td><td>" + data[i].party +  "</td><td> " + (data[i].per_votes*100).toFixed(2) + "</td></tr>";
    }
    modalhtml+="</tbody></table>";
    $('#modal-data').html(modalhtml);
  })
  .fail(function(err) {
    console.log("Error:");
    console.log(err);
  })
}

function mapHandler(datamap) {
  datamap.svg.selectAll('.datamaps-subunit').on('click', function(geography) {
    var state = geography.id;
    var mapType = datamap.options.element.id;
    var year = $('#sel'+mapType+'>li.active').text();

    // setting up modal info
    $('#stateViewTitle').text(state + ' in ' + year + ' ' + mapType + ' elections');
    console.log(data[mapType][year][state])
    // open modal
    // clear data
    $('#modalData>div').empty();
    $('#modalButton').click();
    modalData(state, year, mapType);
});
}
