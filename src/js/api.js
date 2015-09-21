'use strict';

var appmessage = require("./appmessage.js");

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
var requestSLRealtime = function(siteid, callback, packageKey) {
  if(typeof packageKey === 'undefined')
    _xhr(url.slReal3(siteid), callback);
  else
    _xhr(url.slReal3(siteid), callback, packageKey);
};

/**
 * Get depatures from Resrobot stolptidstabeller api
 *
 * @param {number}   siteid     The unique id for a station
 * @param {Function} callback   The callback that should handle the response from the api
 * @param {number}   packageKey A unique key that a set of messages should have
 */
var requestResrobot = function(siteid, callback, packageKey) {
  if(typeof packageKey === 'undefined')
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
