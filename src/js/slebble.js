module.exports = (function() {
  'use strict';

  var appmessage = require('./appmessage.js');
  var api = require('./api.js');
  var slApi = require('apis/sl.js');

  var _provider = '';
  var _config = {};
  var _maxDepatures = 15;
  var _queryIndex = 0;
  var _queryId = 0;
  var _locationOptions = {'timeout': 15000, 'maximumAge': 60000 };
  var _packageKey = 1;
  var _nearbyStations = [];
  var _lastRequest;
  var _lastCallback;
  var _lastOptions = {};

  // Ride Type Constants
  var RT_BUS = 'B';
  var RT_TRAIN = 'J';
  var RT_METRO = 'U';
  var RT_UNKNOWN = '?';

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

    if(typeof packageKey === 'undefined')
      packageKey = _packageKey++;

    var batchLength  = alldeps.length >_maxDepatures?_maxDepatures:alldeps.length;
    appmessage.addRide(alldeps.slice(0, batchLength), packageKey);

    _lastRequest = api.requestResrobot;
    _lastCallback = _resrobotCallback;
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
          ad.from = response.stationsinzoneresult.location[i].name;
          stations.push(ad);
          _nearbyStations.push(response.stationsinzoneresult.location[i]['@id']);
        }
      } else {
        var ad = {};
        ad.from = response.stationsinzoneresult.location.name;
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
    if (time === '') return 0;

    var timeHour = parseInt(time.substr(0, 2));
    var timeMin = parseInt(time.substr(3));
    var date = new Date();
    var realHour = date.getHours();
    var realMin = date.getMinutes();

    if (timeHour < realHour) {
      timeHour += 24;
    }

    var hour = timeHour - realHour;
    var min = hour * 60;

    var dMin = timeMin - realMin;

    if (min === 0 && timeMin < realMin) return 0;

    return min + dMin;
  };

  /**
   * Request rides
   * @param index Station index
   */
   var _requestRides = function(index, step) {
    _queryIndex = index;
    if (step === 0) {
      _queryId = _config.route[index].locationid;
      _nearbyStations = [];
    } else {
      _queryId = _nearbyStations[index];
    }

    if (_provider === 'sl' && step === 0) {
      slApi.realtime(_queryId, {
        busFilterActive: _config.route[_queryIndex].busFilterActive,
        filter: _config.route[_queryIndex].filter,
        maxDepatures: _maxDepatures
      });
    } else {
      api.requestResrobot(_queryId, _resrobotCallback);
    }

  };

  var _requestUpdate = function() {
    _lastRequest(_queryId, _lastCallback, _packageKey-1);
  };

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
    api.requestNearbyStations(coordinates.latitude, coordinates.longitude, _resrobotGeoCallback);
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

  var setLastRequest = (method) => {
    _lastRequest = method;
  }

  var setLastOptions = (options) => {
    _lastOptions = options;
  }

  var open = {
    addStation: appmessage.addStation,
    requestRides: _requestRides,
    requestUpdate: _requestUpdate,
    loadConfig: _loadConfig,
    requestGeoRides: _requestGeoRides,
    setLastOptions: setLastOptions,
    setLastRequest: setLastRequest
  };

  /* test-block */
  open.__testonly__ = {};
  open.__testonly__._slTimeSort = _slTimeSort;
  /* end-test-block */

  return open;

})();
