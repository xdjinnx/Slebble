/* global Pebble */
/* exported Slebble */
var Slebble = (function(Pebble, navigator) {
  'use strict';

  var _key = {};
  _key.slReal3 = '190079364ffe4e278f7e27dabd6dce6c';
  _key.resrobot = 'UacUcP0MlG9fZ0j82r1k5he6KXQ6koSS';

  var _provider = '';
  var _config = {};
  var _maxDepatures = 15;
  var _queryIndex = 0;
  var _locationOptions = {'timeout': 15000, 'maximumAge': 60000 };

  // Ride Type Constants
  var RT_BUS = 'B';
  var RT_TRAIN = 'J';
  var RT_METRO = 'U';

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

  var _appMessageError = function(title, subtitle) {
    console.log('sending error '+title+' '+subtitle);
    Pebble.sendAppMessage({
        '0': 3,
        '7': title,
        '8': subtitle
      },
      function() {},
      function() {
        _appMessageError(title, subtitle);
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
      console.log('ready state '+xhr.readyState);
      console.log('xhr status'+xhr.status);
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          callback(xhr.responseText);
        } else {
          console.log('XHR Error');
          console.log(xhr.status);
          _appMessageError('ERROR', xhr.status);
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
      ad.line = deps[i].LineNumber;
      ad.time = deps[i].DisplayTime;
      ad.dest = deps[i].Destination;
      ad.realtime = deps[i].ExpectedDateTime !== undefined?deps[i].ExpectedDateTime.substring(16,11):'';

      if (deps[i].TransportMode === 'BUS')
        ad.ridetype = RT_BUS;
      else
        ad.ridetype = 'pony';
      alldeps.push(ad);
    }

    alldeps.filter(_filterRides);
    alldeps.sort(function(a, b){
      if (a.time === b.time) // on equal
        return 0;

      // if any of them is Nu
      if (a.time === 'Nu')
        return -1;
      else if (b.time === 'Nu')
        return -1;

      // if one is minute
      else if (a.time.search(':') === -1 && b.time.search(':') > 0)
        return -1;
      else if (a.time.search(':') > 0 && b.time.search(':') === -1)
        return 1;

      else if (a.time.search(':') === -1 && b.time.search(':') === -1) {
        var at = parseInt(a.time.substr(0, a.time.length-4));
        var bt = parseInt(b.time.substr(0, b.time.length-4));
        //console.log(at+'<'+bt+' '+(at<bt?'true -1':'false 1'));
        return at<bt?-1:1;
      } else {
        var ah = parseInt(a.time.split(':')[0]);
        var bh = parseInt(a.time.split(':')[0]);

        if (ah === bh){
          var am = parseInt(a.time.split(':')[1]);
          var bm = parseInt(a.time.split(':')[1]);
          //console.log(am+'<'+bm+' '+(am<bm?'true -1':'false 1'));
          return am<bm?-1:1;
        } else {
          //console.log(ah+'<'+bh+' '+(ah<bh?'true -1':'false 1'));
          return ah<bh?-1:1;
        }
      }
    });

    //console.log('=================================================================');
    //for (var k = 0; k<alldeps.length; k++) {
    //  console.log(k+' '+alldeps[k].time+' '+alldeps[k].realtkme+ ' '+alldeps[k].line+' '+alldeps[k].dest);
    //}
    //console.log('=================================================================');

    var numberToAdd = alldeps.length>_maxDepatures?_maxDepatures:alldeps.length;
    for (var j = 0; j < numberToAdd; j++) {
      _addRide(j,
        alldeps[j].line,
        alldeps[j].dest,
        alldeps[j].realtime,
        alldeps[j].time,
        numberToAdd);
    }
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
      for (var i = filter.length - 1; i >= 0; i--) {
        // only filter buses, else always include
        if(ride.ridetype !== RT_BUS || filter[i] === ride.line)
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
      _appMessageError('No rides available', 'Try again later');
      return;
    }

    var response = JSON.parse(resp);
    var deps = response.getdeparturesresult.departuresegment;
    var alldeps = [];

    if (!Array.isArray(deps))
      deps = [deps];

    for (var i = 0; i < deps.length; i++){
      var ad = {};
      ad.line = deps[i].segmentid.carrier.number;
      ad.time = _determineTimeLeft(deps[i].departure.datetime.substring(11));
      ad.dest = deps[i].direction;
      ad.realtime = deps[i].departure.datetime.substring(11);

      if (deps[i].segmentid.mot['@displaytype'] === 'B')
        ad.ridetype = RT_BUS;
      else
        ab.ridetype = 'pony';
      alldeps.push(ad);
    }

    alldeps.filter(_filterRides);

    // send to watch
    var batchLength  = alldeps.length>_maxDepatures?_maxDepatures:alldeps.length;
    for(var i = 0; i < batchLength; i++) {
      _addRide(i, alldeps[i].segmentid.carrier.number,
        alldeps[i].direction,
        alldeps[i].departure.datetime.substring(11),
        _determineTimeLeft(alldeps[i].departure.datetime.substring(11)),
        batchLength
      );
    }
  };

  /**
   * Push ride to watch
   * @param index        Batch index number
   * @param number       Ride line number
   * @param destination  Ride destination
   * @param time         Departure time HH:MM
   * @param displayTime  Time to display eg. 5m
   * @param nr           The number of rides to be sent this batch
   * @private
   */
  var _addRide = function(index, number, destination, time, displayTime, nr) {
    Pebble.sendAppMessage({
        '0': 2,
        '1': index,
        '3': time,
        '4': number + ' ' + destination,
        '5': nr,
        '6': displayTime
      },
      function() {},
      function() {
        _addRide(index, number, destination, time, displayTime, nr);
      }
    );
  };

  /**
   * Parse time left for resrobot times
   * @param time
   * @returns {number}
   * @private
   */
  var _determineTimeLeft = function(time) {
    //console.log("parsing "+time);
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
    _appMessageError('Location error', 'Can\'t get your location');
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
      _appMessageError('No nearby stations', '');
    }
  };

  // Public api declaration
  var api = {};

  api.addStation = function(index, from, nr) {
    Pebble.sendAppMessage({
        '0': 1,
        '1': index,
        '2': from,
        '5': nr
      },
      function() {},
      function() {
        api.addStation(index, from, nr);
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

Pebble.addEventListener('ready',
            function(e) {
              //console.log('ready');
              var response = localStorage.data;
              if (response !== undefined && response !== '') {
                //console.log('has data');
                response = JSON.parse(localStorage.data);
                //console.log('saved data'+JSON.stringify(response));
                Slebble.loadConfig(response);
                for(var i = 0; i < response.route.length; i++) {
                  Slebble.addStation(i, response.route[i].from.replace(/\053/g, ' '), response.route.length);
                }
              } else {
                //console.log('no data');
                Slebble.addStation(0, 'No configuration', 1);
              }
            });


Pebble.addEventListener('showConfiguration',
            function(e) {
              if (localStorage.data) {
                Pebble.openURL('https://deductive-team-792.appspot.com/webconfig/index.html?version=1.3.0' + '&setting=' + localStorage.data);
              }else {
                Pebble.openURL('https://deductive-team-792.appspot.com/webconfig/index.html?version=1.3.0');
              }
            });

Pebble.addEventListener('webviewclosed',
            function(e) {
              if (e.response === 'reset') {
                localStorage.removeItem('data');
              } else if (e.response !== 'CANCELLED' && e.response.substring(0, 12) !== '{"route": []' && e.response !== '{}') {
                localStorage.setItem('data', e.response);

                if (localStorage.data) {
                  var response = JSON.parse(localStorage.data);
                  Slebble.loadConfig(response);
                  for(var i = 0; i < response.route.length; i++) {
                    Slebble.addStation(i, response.route[i].from.replace(/\053/g, ' '), response.route.length);
                  }
                }
              }
            });

Pebble.addEventListener('appmessage',
            function(e) {
              if(e.payload[1] !== 0) {
                var response = JSON.parse(localStorage.getItem('data'));
                Slebble.loadConfig(response);
                Slebble.requestRides(e.payload[1]-1);
              } else {
                Slebble.requestGeoRides();
              }
            });
