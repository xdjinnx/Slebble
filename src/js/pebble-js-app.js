
var key = "UacUcP0MlG9fZ0j82r1k5he6KXQ6koSS";
var maxDepatures = 15;

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
							if(i == maxDepatures)
								break;
							if(response.getdeparturesresult.departuresegment.length > maxDepatures)
								addRide(i, response.getdeparturesresult.departuresegment[i].segmentid.carrier.number, response.getdeparturesresult.departuresegment[i].direction, response.getdeparturesresult.departuresegment[i].departure.datetime, maxDepatures);
							else	
								addRide(i, response.getdeparturesresult.departuresegment[i].segmentid.carrier.number, response.getdeparturesresult.departuresegment[i].direction, response.getdeparturesresult.departuresegment[i].departure.datetime, response.getdeparturesresult.departuresegment.length);					
						}
						
					} else {
						addRide(0, response.getdeparturesresult.departuresegment.segmentid.carrier.number, response.getdeparturesresult.departuresegment.direction, response.getdeparturesresult.departuresegment.departure.datetime, 1);
					}
				} else {
					appMessageError("No rides available", "Try again later");
				}
						
			} else {
				console.log("Error");
				console.log(req.status);
				appMessageError("ERROR", req.status);
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
					appMessageError("No nearby stations", "");
				}
				
						
			} else {
				console.log("Error");
				console.log(req.status);
				appMessageError("ERROR", req.status);
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

function appMessageError(title, subtitle) {
		Pebble.sendAppMessage({
		"0" : 3,
		"7" : title,
		"8" : subtitle,
		}, 
		function() {},
		function() {
			appMessageError(title, subtitle);
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
	
	if(min === 0 && timeMin < realMin)
		return 0;
		//return	24 * 60 + dMin;
	
	return min + dMin;
	
}

function locationSuccess(pos) {
	var coordinates = pos.coords;
	requestNearbyStation(coordinates.latitude, coordinates.longitude);
}

function locationError(err) {
	console.warn('location error (' + err.code + '): ' + err.message);
	appMessageError("Location error", "Can't get your location");
}

var locationOptions = { "timeout": 15000, "maximumAge": 60000 }; 


Pebble.addEventListener("ready",
						function(e) {
														 
							var response;
							response = localStorage.getItem("data");
							if(response !== null && response !== "") {
								response = JSON.parse(localStorage.getItem("data"));
								
								if( Object.prototype.toString.call( response.route ) === '[object Array]' ) {
									
									for(var i = 0; i < response.route.length; i++) {
										addStation(i, response.route[i].from.replace(/\053/g, " "), response.route.length);
									}
									
								} else {
									addStation(0, response.route.from.replace(/\053/g, " "), 1);
								}
								maxDepatures = parseInt(response.maxDepatures);
							} else {
								addStation(0, "No configuration", 1);
							}
							 
						});


Pebble.addEventListener("showConfiguration",
						function(e) {
							if (localStorage.data) {
								Pebble.openURL('http://mysliceofpi.se/slebble?version=1.1.0' + '&setting=' + localStorage.data);
							}else {
								Pebble.openURL('http://mysliceofpi.se/slebble?version=1.1.0');
							}
						});

Pebble.addEventListener("webviewclosed",
						function(e) {
							
							if(e.response === "reset")
								localStorage.removeItem("data");
							else if(e.response != "CANCELLED" && e.response.substring(0, 12) !== '{"route": []' && e.response !== '{}') {
								localStorage.setItem("data", e.response);
								
								var response;
								response = localStorage.getItem("data");
								if(localStorage.data) {
									response = JSON.parse(response);
									if( Object.prototype.toString.call( response.route ) === '[object Array]' ) {
										for(var i = 0; i < response.route.length; i++) {
											addStation(i, response.route[i].from.replace(/\053/g, " "), response.route.length);
										}
									} else {
										addStation(0, response.route.from.replace(/\053/g, " "), 1);
									}
									maxDepatures = parseInt(response.maxDepatures);
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
 