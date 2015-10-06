/* eslint strict: 0 */

var appmessage = require('./appmessage.js');
var fetch = require('./fetch.js').fetch;

var key = {};
key.slReal3 = '190079364ffe4e278f7e27dabd6dce6c';
key.resrobot = 'UacUcP0MlG9fZ0j82r1k5he6KXQ6koSS';

var url = {};
url.slReal3 = function(locationid) {
  //return 'https://api.sl.se/api2/realtimedepartures.json?key=' + _key.slReal3 + '&siteid=' + locationid + '&timewindow=120';
  // sl has spoky cert?
  return 'http://api.sl.se/api2/realtimedepartures.json?key=' + key.slReal3 + '&siteid=' + locationid + '&timewindow=120';
};
url.resrobot = function(locationid) {
  return 'https://api.trafiklab.se/samtrafiken/resrobotstops/GetDepartures.json?key=' + key.resrobot + '&apiVersion=2.2&locationId=' + locationid + '&coordSys=RT90&timeSpan=120';
};
url.resrobotGeo = function(long, lat) {
  return 'https://api.trafiklab.se/samtrafiken/resrobot/StationsInZone.json?key=' + key.resrobot + '&centerX=' + long + '&centerY=' + lat + '&radius=500&coordSys=WGS84&apiVersion=2.1';
};

/**
 * Send a GET request to URL with Callback
 * @param  {string}   url        Url to request
 * @param  {Function} callback   Function to be called if xhr end with status 200
 * @param  {number}	  packageKey A unique key that a set of messages should have
 */
var _xhr = function(url, callback, packageKey) {
  //console.log('Requesting '+url);
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, false);
  xhr.onload = function(e) {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        if(typeof packageKey === 'undefined')
          callback(xhr.responseText);
        else
          callback(xhr.responseText, packageKey);
      } else {
        //console.log('XHR Error');
        //console.log(xhr.status);
        appmessage.appMessageError('ERROR', xhr.status, packageKey++);
      }
    }
  };
  xhr.send();
};

/**
 * Get depatures from SLReal3 api
 *
 * @param {number}   siteid     The unique id for a station
 * @param {Function} callback   The callback that should handle the response from the api
 * @param {number}   packageKey A unique key that a set of messages should have
 */
var requestSLRealtime = (siteid, packageKey) => {
  if (typeof packageKey === 'undefined') {
    fetch(url.slReal3(siteid))
    .then(response => _SLRealtimeCallback(response));
  } else {
    fetch(url.slReal3(siteid))
    .then(response => _SLRealtimeCallback(response))
    .catch((error) => {
      appmessage.appMessageError('ERROR', error, packageKey++);
    });
  }
};

var _SLRealtimeCallback = function(resp, packageKey) {
    //console.log('sl callback');
    var response = JSON.parse(resp);
    var alldeps = [];
    var deps = [];

    if (Array.isArray(response.ResponseData.Metros)) {
      Array.prototype.push.apply(deps, response.ResponseData.Metros);
    }
    if (Array.isArray(response.ResponseData.Buses)) {
      Array.prototype.push.apply(deps, response.ResponseData.Buses);
    }
    if (Array.isArray(response.ResponseData.Trains)) {
      Array.prototype.push.apply(deps, response.ResponseData.Trains);
    }

    for (var i = 0; i < deps.length; i++){
      var ad = {};
      ad.number = deps[i].LineNumber;
      if(deps[i].DisplayTime === 'Nu') {
        ad.displayTime = 0;
        ad.time = _determineTime(0);
      }
      else {
        ad.displayTime = deps[i].DisplayTime.substring(deps[i].DisplayTime.length-3, deps[i].DisplayTime.length) !== 'min'?_determineTimeLeft(deps[i].DisplayTime):parseInt(deps[i].DisplayTime.substring(0, deps[i].DisplayTime.length - 4));
        ad.time = deps[i].DisplayTime.substring(deps[i].DisplayTime.length-3, deps[i].DisplayTime.length) !== 'min'?deps[i].DisplayTime:_determineTime(ad.displayTime);
      }
      ad.destination = deps[i].Destination;


      if (deps[i].TransportMode === 'BUS') {
        ad.ridetype = RT_BUS;
      } else {
        ad.ridetype = RT_UNKNOWN;
      }
      alldeps.push(ad);
    }

    alldeps = alldeps.filter(_filterRides);
    alldeps = alldeps.sort(_slTimeSort);

    if (alldeps.length < 1){
      appmessage.appMessageError('No rides available', 'Try again later', _packageKey++);
      return;
    }

    if (typeof packageKey === 'undefined') packageKey = _packageKey++;

    var numberToAdd = alldeps.length>_maxDepatures?_maxDepatures:alldeps.length;
    appmessage.addRide(alldeps.slice(0, numberToAdd), packageKey);

    _lastRequest = api.requestSLRealtime;
    _lastCallback = _SLRealtimeCallback;

  };

  var _determineTime = function(timeleft) {
    var date = new Date();
    var realHour = date.getHours();
    var realMin = date.getMinutes();
    var zero = '';

    realMin = realMin + timeleft;

    realHour = realHour + Math.floor(realMin / 60);
    realMin = realMin % 60;

    realHour = realHour % 24;

    if (realMin < 10) zero = '0';

    return realHour + ':' + zero + realMin;

};

/**
 * Get depatures from Resrobot stolptidstabeller api
 *
 * @param {number}   siteid     The unique id for a station
 * @param {Function} callback   The callback that should handle the response from the api
 * @param {number}   packageKey A unique key that a set of messages should have
 */
var requestResrobot = function(siteid, callback, packageKey) {
  if (typeof packageKey === 'undefined')
    _xhr(url.resrobot(siteid), callback);
  else
    _xhr(url.resrobot(siteid), callback, packageKey);
};


/**
 * Get stations with coordinates from Resrobot api
 * @param {number} latitude   Latitude coordinate for station
 * @param {number} longitude  Longitude coordinate for station
 * @param {Function} callback The callback that should handle the response from the api
 */
var requestNearbyStations = function(latitude, longitude, callback) {
  _xhr(url.resrobotGeo(longitude, latitude), callback);
};

module.exports = {
	requestSLRealtime: requestSLRealtime,
	requestResrobot: requestResrobot,
	requestNearbyStations: requestNearbyStations
};
