





function listenSubmit(){
	$("#submit").click(function(event){
		var request = {}
		console.log($("#party_type").val())
		if ($("#party_type").val() =="" ||( $("#party_type").val()!="R" && $("#party_type").val() != "D")){
			alert("Please specify pary: R for republican or D for democrat")
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
				console.log(resp)
				if(resp.score == null || resp.score==undefined){
					resp.score = -1
				}
				row.find("#house_score").html("<p>"+(resp.score).toFixed(2)+"</p>")
			})
			$.ajax({
				type: "GET",
				url:'/senatestats',
				data:{'party':$("#party_type").val(),'state':state,'input':senate},

			})
			.done(function(resp){
				console.log(resp)
				if(resp.score == null || resp.score==undefined){
					resp.score = -1
				}
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
	listenSubmit()

})
