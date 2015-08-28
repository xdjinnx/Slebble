module.exports = (function(navigator) {
  'use strict';

  var appmessage = require("./appmessage.js");

  var _key = {};
  _key.slReal3 = '190079364ffe4e278f7e27dabd6dce6c';
  _key.resrobot = 'UacUcP0MlG9fZ0j82r1k5he6KXQ6koSS';

  var _provider = '';
  var _config = {};
  var _maxDepatures = 15;
  var _queryIndex = 0
  var _queryId = 0;
  var _locationOptions = {'timeout': 15000, 'maximumAge': 60000 };
  var _packageKey = 1;
  var _nearbyStations = [];
  var _lastRequest;

  // Ride Type Constants
  var RT_BUS = 'B';
  var RT_TRAIN = 'J';
  var RT_METRO = 'U';
  var RT_UNKNOWN = '?';

  var _url = {};
  _url.slReal3 = function(locationid) {
    //return 'https://api.sl.se/api2/realtimedepartures.json?key=' + _key.slReal3 + '&siteid=' + locationid + '&timewindow=120';
    // sl has spoky cert?
    return 'http://api.sl.se/api2/realtimedepartures.json?key=' + _key.slReal3 + '&siteid=' + locationid + '&timewindow=120';
  };
  _url.resrobot = function(locationid) {
    return 'https://api.trafiklab.se/samtrafiken/resrobotstops/GetDepartures.json?key=' + _key.resrobot + '&apiVersion=2.2&locationId=' + locationid + '&coordSys=RT90&timeSpan=120';
  };
  _url.resrobotGeo = function(long, lat) {
    return 'https://api.trafiklab.se/samtrafiken/resrobot/StationsInZone.json?key=' + _key.resrobot + '&centerX=' + long + '&centerY=' + lat + '&radius=500&coordSys=WGS84&apiVersion=2.1';
  };

  /**
   * Load config object
   * @param config Json object
   */
  var _loadConfig = function(config) {
    console.log('Loading config..');
    _config = config;
    _provider = config.provider;
    _maxDepatures = parseInt(config.maxDepatures);
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
          appmessage.appMessageError('ERROR', xhr.status, _packageKey++);
        }
      }
    };
    xhr.send();
  };

  var _SLRealtimeCallback = function(resp, packageKey) {
    //console.log('sl callback');
    var response = JSON.parse(resp);
    var alldeps = [];
    var deps = [];

    if (Array.isArray(response.ResponseData.Metros))
      Array.prototype.push.apply(deps, response.ResponseData.Metros);
    if (Array.isArray(response.ResponseData.Buses))
      Array.prototype.push.apply(deps, response.ResponseData.Buses);
    if (Array.isArray(response.ResponseData.Trains))
      Array.prototype.push.apply(deps, response.ResponseData.Trains);

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
      

      if (deps[i].TransportMode === 'BUS')
        ad.ridetype = RT_BUS;
      else
        ad.ridetype = RT_UNKNOWN;
      alldeps.push(ad);
    }

    alldeps = alldeps.filter(_filterRides);
    alldeps = alldeps.sort(_slTimeSort);

    if (alldeps.length < 1){
      appmessage.appMessageError('No rides available', 'Try again later', _packageKey++);
      return;
    }

    var numberToAdd = alldeps.length>_maxDepatures?_maxDepatures:alldeps.length;
    for (var j = 0; j < numberToAdd; j++) {
      alldeps[j].index = j;
      alldeps[j].nr = numberToAdd;
    }



    if(typeof packageKey === 'undefined')
      packageKey = _packageKey++;
    appmessage.addRide(alldeps.slice(0, numberToAdd), packageKey);

    _lastRequest = _requestSLRealtime;

  };

  var _slTimeSort = function(a, b){
    if(a.displayTime === b.displayTime)
      return 0;
    if(a.displayTime < b.displayTime)
      return -1;
    return 1;
  };

  /**
   * Filter function for rides to be used with array.filter
   * @param ride        A ride object, se sample in _SLRealtimeCallback
   * @returns {boolean} Returns true if ride is to be included
   * @private
   */
  var _filterRides = function(ride){
    // only filter if filter is actually active
    if (_config.route[_queryIndex].busFilterActive === 'true'){
      var filter = _config.route[_queryIndex].filter;
      
      if(ride.ridetype !== RT_BUS)
        return true;

      for (var i = filter.length - 1; i >= 0; i--) {
        // only filter buses, else always include
        if(filter[i] === ride.number)
          return true;
      }
      return false;
    }
    return true;
  };

  var _resrobotCallback = function(resp, packageKey) {
    // check for empty response
    if (resp === '{"getdeparturesresult":{}}') {
      appmessage.appMessageError('No rides available', 'Try again later', _packageKey++);
      return;
    }

    var response = JSON.parse(resp);
    var deps = response.getdeparturesresult.departuresegment;
    var alldeps = [];

    if (!Array.isArray(deps))
      deps = [deps];

    for (var i = 0; i < deps.length; i++){
      var ad = {};
      ad.index = i;
      ad.number = deps[i].segmentid.carrier.number;
      ad.destination = deps[i].direction;
      ad.time = deps[i].departure.datetime.substring(11);
      ad.displayTime = _determineTimeLeft(ad.time);

      if (deps[i].segmentid.mot['@displaytype'] === 'B')
        ad.ridetype = RT_BUS;
      else
        ad.ridetype = RT_UNKNOWN;
      alldeps.push(ad);
    }

    if(_nearbyStations.length === 0)
      alldeps = alldeps.filter(_filterRides);

    // send to watch
    var batchLength  = alldeps.length >_maxDepatures?_maxDepatures:alldeps.length;
    for(var j = 0; j < batchLength; j++) {
      alldeps[j].nr = batchLength;
    }

    if(typeof packageKey === 'undefined')
      packageKey = _packageKey++;
    appmessage.addRide(alldeps.slice(0, batchLength), packageKey);

    _lastRequest = _requestResrobot;
  };

  var _resrobotGeoCallback = function(resp) {
    //console.log(resp);
    if(resp !== '{"stationsinzoneresult":{}}') {
      var response = JSON.parse(resp);
      var stations = [];
      _nearbyStations = [];
      if( Object.prototype.toString.call( response.stationsinzoneresult.location ) === '[object Array]' ) {
        var batchLength = response.stationsinzoneresult.location.length > 5 ? 5:response.stationsinzoneresult.location.length;
        for(var i = 0; i < batchLength; i++) {
          var ad = {};
          ad.index = i;
          ad.from = response.stationsinzoneresult.location[i].name;
          ad.nr = batchLength;
          stations.push(ad);
          _nearbyStations.push(response.stationsinzoneresult.location[i]['@id']);
        }
      } else {
        var ad = {};
        ad.index = 0;
        ad.from = response.stationsinzoneresult.location.name;
        ad.nr = 1;
        stations.push(ad);
        _nearbyStations = [response.stationsinzoneresult.location['@id']];
      }

      appmessage.addStation(stations, _packageKey++);
    
    } else {
      appmessage.appMessageError('No nearby stations', '', _packageKey++);
    }
  };

  /**
   * Parse time left for resrobot times
   * @param time HH:MM
   * @returns {number}
   * @private
   */
  var _determineTimeLeft = function(time) {
    if(time === '')
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

    return min + dMin;
  };

  var _determineTime = function(timeleft) {
      var date = new Date();
      var realHour = date.getHours();
      var realMin = date.getMinutes();
      var zero = "";

      realMin = realMin + timeleft;

      realHour = realHour + Math.floor(realMin / 60);
      realMin = realMin % 60;

      realHour = realHour % 24;

      if(realMin < 10)
        zero = "0";

      return realHour + ":" + zero + realMin;

  }

  var _requestSLRealtime = function(siteid, packageKey) {
    if(typeof packageKey === 'undefined')
      _xhr(_url.slReal3(siteid), _SLRealtimeCallback);
    else
      _xhr(_url.slReal3(siteid), _SLRealtimeCallback, packageKey);
  };

  var _requestResrobot = function(siteid, packageKey) {
    if(typeof packageKey === 'undefined')
      _xhr(_url.resrobot(siteid), _resrobotCallback);
    else
      _xhr(_url.resrobot(siteid), _resrobotCallback, packageKey);
  };

  var _requestNearbyStations = function(latitude, longitude) {
    _xhr(_url.resrobotGeo(longitude, latitude), _resrobotGeoCallback);
  };

  /**
   * Request rides
   * @param index Station index
   */
   var _requestRides = function(index, step) {
    _queryIndex = index;
    if(step === 0) {
      _queryId = _config.route[index].locationid;
      _nearbyStations = [];
    }
    else
      _queryId = _nearbyStations[index];

    if (_provider === 'sl' && step === 0) {
      _requestSLRealtime(_queryId);
    }
    else
      _requestResrobot(_queryId);
    
  };

  var _requestUpdate = function() {
    _lastRequest(_queryId, _packageKey-1);
  }

  var _requestGeoRides = function() {
    navigator.geolocation.getCurrentPosition(_locationSuccess, _locationError, _locationOptions);
  };

  /**
   * Callback from location service on success
   * @param pos
   * @private
   */
  var _locationSuccess = function(pos) {
    var coordinates = pos.coords;
    _requestNearbyStations(coordinates.latitude, coordinates.longitude);
  };

  /**
   * Callback from location service on fail
   * @param err
   * @private
   */
  var _locationError = function(err) {
    console.warn('location error (' + err.code + '): ' + err.message);
    appmessage.appMessageError('Location error', 'Can\'t get your location', _packageKey++);
  };

  return  {
    addStation: appmessage.addStation,
    requestRides: _requestRides,
    requestUpdate: _requestUpdate,
    loadConfig: _loadConfig,
    requestGeoRides: _requestGeoRides
  };

})(navigator);