module.exports = (function() {
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
   * @param  {string}   url      Url to request
   * @param  {Function} callback Function to be called if xhr end with status 200
   * @private
   */
  var _xhr = function(url, callback, packageKey) {
    console.log('Requesting '+url);
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
          console.log('XHR Error');
          console.log(xhr.status);
          appmessage.appMessageError('ERROR', xhr.status, packageKey++);
        }
      }
    };
    xhr.send();
  };

  var requestSLRealtime = function(siteid, callback, packageKey) {
    if(typeof packageKey === 'undefined')
      _xhr(url.slReal3(siteid), callback);
    else
      _xhr(url.slReal3(siteid), callback, packageKey);
  };

  var requestResrobot = function(siteid, callback, packageKey) {
    if(typeof packageKey === 'undefined')
      _xhr(url.resrobot(siteid), callback);
    else
      _xhr(url.resrobot(siteid), callback, packageKey);
  };

  var requestNearbyStations = function(latitude, longitude, callback) {
    _xhr(url.resrobotGeo(longitude, latitude), callback);
  };

  return {
  	requestSLRealtime: requestSLRealtime,
  	requestResrobot: requestResrobot,
  	requestNearbyStations: requestNearbyStations
  };

})();