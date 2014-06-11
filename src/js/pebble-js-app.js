

function requestRides(locationid) {
	var key = "SLKEY";
	var response;
	var req = new XMLHttpRequest();
	req.open('GET', 
			'https://api.trafiklab.se/samtrafiken/resrobotstops/GetDepartures.json?key=' + key + '&apiVersion=2.2&locationId=' + locationid + '&coordSys=RT90&timeSpan=120', false);
	req.onload = function(e) {
		if (req.readyState == 4) {
			if(req.status == 200) {
				//console.log(req.responseText);
				
				if(req.responseText !== '{"getdeparturesresult":{}}') {
					response = JSON.parse(req.responseText);
					if( Object.prototype.toString.call( response.getdeparturesresult.departuresegment ) === '[object Array]' ) {
						
						for(var i = 0; i < response.getdeparturesresult.departuresegment.length; i++){
							if(i == 20)
								break;
								addRide(i, response.getdeparturesresult.departuresegment[i].segmentid.carrier.number, response.getdeparturesresult.departuresegment[i].direction, response.getdeparturesresult.departuresegment[i].departure.datetime, response.getdeparturesresult.departuresegment.length);					
						}
						
					} else {
						addRide(0, response.getdeparturesresult.departuresegment.segmentid.carrier.number, response.getdeparturesresult.departuresegment.direction, response.getdeparturesresult.departuresegment.departure.datetime, 1);
					}
				} else {
					addRide(0, "No rides available", "Try again later", "", 1);
				}
						
			} else {
				console.log("Error");
				console.log(req.status);
				addRide(0, "ERROR", req.status, "", 1);
			}
		}
	};
	req.send(null);

}

function addStation(index, from, nr) {
	Pebble.sendAppMessage({
		"0" : 1,
		"1" : index,
		"2" : from,
		"5" : nr
		}, 
		function() {},
		function() {
			addStation(index, from, nr);
		}
	);
	
}

function addRide(index, number, to, time, nr) {
	Pebble.sendAppMessage({
		"0" : 2,
		"1" : index,
		"3" : number + " - " + time.substring(11),
		"4" : to,
		"5" : nr
		}, 
		function() {},
		function() {
			addRide(index, number, to, time, nr);
		}
	);
	
}


Pebble.addEventListener("ready",
						function(e) {
														 
							var response;
							response = localStorage.getItem("data");
							if(response !== null && response !== "") {
								//console.log("Config done, and response is " + response);
								response = JSON.parse(localStorage.getItem("data"));
								//console.log("config parsed");
								if( Object.prototype.toString.call( response.route ) === '[object Array]' ) {
									//console.log("array found");
									for(var i = 0; i < response.route.length; i++) {
										addStation(i, response.route[i].from.replace(/\053/g, " "), response.route.length);
									}
								} else {
									//console.log("no array found");
									addStation(0, response.route.from.replace(/\053/g, " "), 1);
								}
							} else {
								//console.log("no config found!");
								addStation(0, "No configuration", 1);
							}
							 
						});


Pebble.addEventListener("showConfiguration",
						function(e) {
							//localStorage.removeItem("data");
							Pebble.openURL('http://mysliceofpi.se/slebble/slebble_conf_1_0_0.html');
						});

Pebble.addEventListener("webviewclosed",
						function(e) {
							console.log("Configuration window returned: " + e.response);
							
							if(e.response === "reset")
								localStorage.removeItem("data");
							else if(e.response != "CANCELLED" && e.response !== '{"route": []}' && e.response !== '{}') {
								localStorage.setItem("data", e.response);
								
								var response;
								response = localStorage.getItem("data");
								if(response !== null && response !== "") {
									//console.log("Config done, and response is " + response);
									response = JSON.parse(localStorage.getItem("data"));
									//console.log("config parsed");
									if( Object.prototype.toString.call( response.route ) === '[object Array]' ) {
										//console.log("array found");
										for(var i = 0; i < response.route.length; i++) {
											addStation(i, response.route[i].from.replace(/\053/g, " "), response.route.length);
										}
									} else {
										//console.log("no array found");
										addStation(0, response.route.from.replace(/\053/g, " "), 1);
									}
								} else {
									//console.log("no config found!");
									addStation(0, "No configuration", 1);
								}
							}

						});

Pebble.addEventListener("appmessage",
						function(e) {							
							var response;
							response = JSON.parse(localStorage.getItem("data"));
							requestRides(response.route[e.payload[1]].locationid);
						});
 
