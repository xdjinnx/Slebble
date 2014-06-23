
var key = "UacUcP0MlG9fZ0j82r1k5he6KXQ6koSS";

function requestRides(locationid) {
	
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
							if(i == 15)
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

function requestNearbyStation(latitude, longitude) {
	
	var response;
	var req = new XMLHttpRequest();
	req.open('GET', 
			'https://api.trafiklab.se/samtrafiken/resrobot/StationsInZone.json?key=' + key + '&centerX=' + longitude + '&centerY=' + latitude + '&radius=500&coordSys=WGS84&apiVersion=2.1', false);
		req.onload = function(e) {
		if (req.readyState == 4) {
			if(req.status == 200) {
				//console.log(req.responseText);
				
				if(req.responseText !== '{"stationsinzoneresult":{}}') {
					response = JSON.parse(req.responseText);
					if( Object.prototype.toString.call( response.stationsinzoneresult.location ) === '[object Array]' ) {
						requestRides(response.stationsinzoneresult.location[0]['@id']);
					} else {
						requestRides(response.stationsinzoneresult.location['@id']);
					}
				} else {
					addRide(0, "No nearby stations", "", "", 1);
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
		"3" : time.substring(11),
		"4" : number + " " + to,
		"5" : nr,
		"6" : determineTimeLeft(time.substring(11))
		}, 
		function() {},
		function() {
			addRide(index, number, to, time, nr);
		}
	);
	
}

function determineTimeLeft(time) {
	if(time === "")
		return 0;
	var timeHour = parseInt(time.substr(0, 2));
	var timeMin = parseInt(time.substr(3));
	var date = new Date();
	var realHour = date.getHours();
	var realMin = date.getMinutes();
	
	if(timeHour < realHour) {
		timeHour += 24;
	}
	
	var hour = timeHour - realHour;
	var min = hour * 60;
	
	var dMin = timeMin - realMin;
	
	return min + dMin;
	
}

function locationSuccess(pos) {
	var coordinates = pos.coords;
	requestNearbyStation(coordinates.latitude, coordinates.longitude);
}

function locationError(err) {
	console.warn('location error (' + err.code + '): ' + err.message);
}

var locationOptions = { "timeout": 15000, "maximumAge": 60000 }; 


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
							//console.log("Configuration window returned: " + e.response);
							
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
							if(e.payload[1] !== 0) {
								var response;
								response = JSON.parse(localStorage.getItem("data"));
								requestRides(response.route[e.payload[1]-1].locationid);
							} else
								window.navigator.geolocation.getCurrentPosition(locationSuccess, locationError, locationOptions);
						});
 