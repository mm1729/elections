var mapData = {
	"house" : {},
	"senate" : {}
}

var houseCount = 0
var senateCount = 0
var houseMap = null
var senateMap = null

function gatherData(state, predictionType, value, partyAbbr) {
	var party = (partyAbbr === 'R') ? 'Republican' : 'Democrat'
	var otherParty = (partyAbbr === 'R') ? 'Democrat' : 'Republican'

	var designation = 'Others';
	if(predictionType === 'house') {
		if(value < -0.75) {
			designation = 'Heavy ' + otherParty
		} else if(value < -0.25) {
			designation = otherParty
		} else if(value < 0) {
			designation = 'Light ' + otherParty
		} else if(value == 0) {
			designation = 'Mixed';
		} else if(value < 0.25) {
			designation = 'Light ' + party;
		} else if(value < 0.75) {
			designation = party;
		} else {
			designation = 'Heavy ' + party;
		}
	} else {
		if(value < 0.2) {
			designation = 'Heavy ' + otherParty
		} else if(value < 0.35) {
			designation = otherParty
		} else if(value < 0.5) {
			designation = 'Light ' + otherParty
		} else if(value == 0.5) {
			designation = 'Mixed';
		} else if(value < 0.65) {
			designation = 'Light ' + party;
		} else if(value < 0.8) {
			designation = party;
		} else {
			designation = 'Heavy ' + party;
		}
	}

	mapData[predictionType][state]['confidence'] = value;
	mapData[predictionType][state]['fillKey'] =  designation;

	(predictionType === 'senate') ? senateCount++ : houseCount++
	if(senateCount === 51 && senateCount !== -50) {
		senateMap = createMap('senate')
		console.log(mapData['senate']['CA'])
		updateMap('senate')
		senateCount = -50
	}
	if(houseCount === 51 && senateCount !== -50) {
		houseMap = createMap('house')
		console.log(mapData['house']['CA'])
		updateMap('house')
		houseCount = -50
	}
}

function updateMap(mapType) {
  if(mapType == 'house') {
    houseMap.updateChoropleth(mapData['house']);
  } else if(mapType == 'senate') {
    senateMap.updateChoropleth(mapData['senate']);
  } else {
    console.log('Error with selecting maptype');
  }
}

function createMap(type, predictionType) {
	console.log('in create map')
  var map = new Datamap(getDataMapInput(type, mapData[predictionType]));
  map.labels();
  return map;
}

function getDataMapInput(elementId, legendData) {
  return {
    scope: 'usa',
    element: document.getElementById(elementId),
    geographyConfig: {
            highlightBorderColor: '#bada55',
           popupTemplate: function(geography, data) {
                     return '<div class="hoverinfo">' + geography.properties.name +
                   ' Confidence: ' +  data['confidence'] + ' '
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
    data: legendData
  }
}

function listenSubmit(){
	$("#submit").click(function(event){
		houseMap = null
		senateMap = null
		var request = {}
		console.log($("#party_type").val())
		if ($("#party_type").val() =="" ||( $("#party_type").val()!="R" && $("#party_type").val() != "D")){
			alert("Please specify party: R for republican or D for democrat")
			return
		}
		$("#table_body").find('tr').each(function(i,el){
			var tds = $(this).find('td')
			var row = $(this)
			var state = tds.eq(0).text()
			var house =$(tds).find('#house_districts').val()
			var senate = $(tds).find('#senate_votes').val()
			var house_result =0
			$.ajax({
				type: "GET",
				url:'/housestats',
				data:{'party':$("#party_type").val(),'state':state,'input':house},

			})
			.done(function(resp){
				//console.log(resp)
				if(resp.score == null || resp.score==undefined){
					resp.score = -1
				}
				gatherData(state, 'house', resp.score, $("#party_type").val())
				row.find("#house_score").html("<p>"+(resp.score).toFixed(2)+"</p>")
			})
			$.ajax({
				type: "GET",
				url:'/senatestats',
				data:{'party':$("#party_type").val(),'state':state,'input':senate},

			})
			.done(function(resp){
				//console.log(resp)
				if(resp.score == null || resp.score==undefined){
					resp.score = -1
				}
				gatherData(state, 'senate', resp.score, $("#party_type").val())
				row.find("#senate_score").html("<p>"+(resp.score).toFixed(2)+"</p>")
			})
		})
		$.ajax({
			type : "GET",
				url:'/finances',
				data:{'election':'house','party':$("#party_type").val()}
			})
			.done(function(resp){
					console.log(resp)
					$("#expense_body").find("#house_exp").html(
						"<td>house</td>"
						+"<td>"
						+resp.expenses
						+"</td>"
						)

			})
		$.ajax({
			type : "GET",
				url:'/finances',
				data:{'election':'senate','party':$("#party_type").val()}
			})
			.done(function(resp){
					console.log(resp)
					$("#expense_body").find("#senate_exp").html(
						"<td>senate</td>"
						+"<td>"
						+resp.expenses
						+"</td>"
					)

			})
	})
}

function initMapData() {
	var states = ['AK', 'AL', 'AR', 'AZ', 'CA', 'CO', 'CT', 'DC', 'DE', 'FL', 'GA', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'MA', 'MD', 'ME', 'MI', 'MN', 'MO', 'MS', 'MT', 'NC', 'ND', 'NE', 'NH', 'NJ', 'NM', 'NV', 'NY', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VA', 'VT', 'WA', 'WI', 'WV', 'WY'];

	var legendData = {};
	for(state in states){
		legendData[states[state]] = {
			"fillKey" : "No Election",
			"confidence":  "0"
		};
	}

	for (var key in mapData) {
		if (mapData.hasOwnProperty(key)) {
			mapData[key] = jQuery.extend(true, {}, legendData);
		}
	}
}

function initData(){
	  var states = ['AK', 'AL', 'AR', 'AZ', 'CA', 'CO', 'CT', 'DC', 'DE', 'FL', 'GA', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'MA', 'MD', 'ME', 'MI', 'MN', 'MO', 'MS', 'MT', 'NC', 'ND', 'NE', 'NH', 'NJ', 'NM', 'NV', 'NY', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VA', 'VT', 'WA', 'WI', 'WV', 'WY'];

	for(i in states){
		$("#table_body").append(
			"<tr><td>"+states[i]+"</td>"
				+"<td><input type=\"number\" class=\"form-control\" id=\"house_districts\"></td>"
				+"<td><input type=\"text\" class=\"form-control\" id=\"senate_votes\"></td>"
				+"<td id=\"house_score\"></td>"
				+"<td id=\"senate_score\"></td>"
				+"</tr>")
	}


}

$(document).ready(function(){
	initData()
	initMapData()
	listenSubmit()

})
