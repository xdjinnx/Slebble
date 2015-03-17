module.exports = (function(Pebble, navigator) {
  'use strict';

  var _key = {};
  _key.slReal3 = '190079364ffe4e278f7e27dabd6dce6c';
  _key.resrobot = 'UacUcP0MlG9fZ0j82r1k5he6KXQ6koSS';

  var _provider = '';
  var _config = {};
  var _maxDepatures = 15;
  var _queryIndex = 0;
  var _locationOptions = {'timeout': 15000, 'maximumAge': 60000 };
  var _packageKey = 0;

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

  var _appMessageError = function(title, subtitle, packageKey) {
    console.log('sending error '+title+' '+subtitle);
    Pebble.sendAppMessage({
        '0': 3,
        '1': 0,
        '5': 1,
        '7': title,
        '8': subtitle,
        '9': packageKey
      },
      function() {},
      function() {
        _appMessageError(title, subtitle, packageKey);
      }
    );
  };

  /**
   * Send a GET request to URL with Callback
   * @param  {string}   url      Url to request
   * @param  {Function} callback Function to be called if xhr end with status 200
   * @private
   */
  var _xhr = function(url, callback) {
    console.log('Requesting '+url);
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.onload = function(e) {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          callback(xhr.responseText);
        } else {
          console.log('XHR Error');
          console.log(xhr.status);
          _appMessageError('ERROR', xhr.status, _packageKey++);
        }
      }
    };
    xhr.send();
  };

  var _requestSLRealtime = function(siteid) {
    _xhr(_url.slReal3(siteid), _SLRealtimeCallback);
  };

  var _SLRealtimeCallback = function(resp) {
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
      //console.log(i + " Before if: " + deps[i].DisplayTime);
      //console.log(i + " After if: " + ad.displayTime);
    }

    alldeps = alldeps.filter(_filterRides);
    alldeps = alldeps.sort(_slTimeSort);

    if (alldeps.length < 1){
      _appMessageError('No rides available', 'Try again later', _packageKey++);
      return;
    }

    var numberToAdd = alldeps.length>_maxDepatures?_maxDepatures:alldeps.length;
    for (var j = 0; j < numberToAdd; j++) {
      alldeps[j].index = j;
      alldeps[j].nr = numberToAdd;
    }

    _addRide(alldeps.slice(0, numberToAdd), _packageKey++);
  };

  var _slTimeSort = function(a, b){
    if(a.displayTime === b.displayTime)
      return 0;
    if(a.displayTime < b.displayTime)
      return -1;
    else
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
    } else {
      return true;
    }
  };

  var _requestResrobot = function(siteid) {
    _xhr(_url.resrobot(siteid), _resrobotCallback);
  };

  var _resrobotCallback = function(resp) {
    // check for empty response
    if (resp === '{"getdeparturesresult":{}}') {
      _appMessageError('No rides available', 'Try again later', _packageKey++);
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

    alldeps = alldeps.filter(_filterRides);

    // send to watch
    var batchLength  = alldeps.length >_maxDepatures?_maxDepatures:alldeps.length;
    for(var j = 0; j < batchLength; j++) {
      alldeps[j].nr = batchLength;
    }

    _addRide(alldeps.slice(0, batchLength), _packageKey++);

  };


  var _addRide = function(depatureList, packageKey) {
    if(depatureList.length < 1)
      return;

    Pebble.sendAppMessage({
        '0': 2,
        '1': depatureList[0].index,
        '3': depatureList[0].time,
        '4': depatureList[0].number + ' ' + depatureList[0].destination,
        '5': depatureList[0].nr,
        '6': depatureList[0].displayTime,
        '9': packageKey
      },
      function() {
        depatureList.shift();
        _addRide(depatureList, packageKey);
      },
      function() {
        _addRide(depatureList, packageKey);
      }
    );
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

  /**
   * Callback from location service on success
   * @param pos
   * @private
   */
  var _locationSuccess = function(pos) {
    var coordinates = pos.coords;
    _requestNearbyStation(coordinates.latitude, coordinates.longitude);
  };

  /**
   * Callback from location service on fail
   * @param err
   * @private
   */
  var _locationError = function(err) {
    console.warn('location error (' + err.code + '): ' + err.message);
    _appMessageError('Location error', 'Can\'t get your location', _packageKey++);
  };

  var _requestNearbyStation = function(latitude, longitude) {
    _xhr(_url.resrobotGeo(longitude, latitude), _resrobotGeoCallback);
  };

  var _resrobotGeoCallback = function(resp) {
    if(resp !== '{"stationsinzoneresult":{}}') {
      var response = JSON.parse(resp);
      if( Object.prototype.toString.call( response.stationsinzoneresult.location ) === '[object Array]' ) {
        _requestResrobot(response.stationsinzoneresult.location[0]['@id']);
      } else {
        _requestResrobot(response.stationsinzoneresult.location['@id']);
      }
    } else {
      _appMessageError('No nearby stations', '', _packageKey++);
    }
  };

  // Public api declaration
  var api = {};

  // export private methods for testability
  api._test = {};
  api._test.slTimeSort = _slTimeSort;

  api.addStation = function(stations) {
    if(stations.length < 1)
      return;
    Pebble.sendAppMessage({
        '0': 1,
        '1': stations[0].index,
        '2': stations[0].from,
        '5': stations[0].nr,
        '9': 0
      },
      function() {
        stations.shift();
        api.addStation(stations);
      },
      function() {
        api.addStation(stations);
      }
    );
  };

  /**
   * Request rides
   * @param index Station index
   */
  api.requestRides = function(index) {
    _queryIndex = index;
    var id = _config.route[index].locationid;
    if (_provider === 'sl') {
      _requestSLRealtime(id);
    } else if (_provider === 'resrobot') {
      _requestResrobot(id);
    } else { // fallback for old users
      _requestResrobot(id);
    }
  };

  /**
   * Load config object
   * @param config Json object
   */
  api.loadConfig = function(config) {
    console.log('Loading config..');
    _config = config;
    _provider = config.provider;
    _maxDepatures = parseInt(config.maxDepatures);
  };

  api.requestGeoRides = function() {
    navigator.geolocation.getCurrentPosition(_locationSuccess, _locationError, _locationOptions);
  };

  console.log('Slebble js init');
  return api;

})(Pebble, navigator);