/* eslint strict: 0 */

var appmessage = require('./appmessage.js');
var fetch = require('./fetch.js').fetch;
var util = require('../util.js');
var cnst = require('../const.js');
var Slebble = require('../slebble.js');

var key = {};
key.resrobot = 'UacUcP0MlG9fZ0j82r1k5he6KXQ6koSS';

var _nearbyStations = [];

var url = {};
url.resrobot = function(locationid) {
  return 'https://api.trafiklab.se/samtrafiken/resrobotstops/GetDepartures.json?key=' + key.resrobot + '&apiVersion=2.2&locationId=' + locationid + '&coordSys=RT90&timeSpan=120';
};
url.resrobotGeo = function(long, lat) {
  return 'https://api.trafiklab.se/samtrafiken/resrobot/StationsInZone.json?key=' + key.resrobot + '&centerX=' + long + '&centerY=' + lat + '&radius=500&coordSys=WGS84&apiVersion=2.1';
};


/**
 * Get depatures from Resrobot stolptidstabeller api
 *
 * @param {number}   siteid     The unique id for a station
 * @param {Function} callback   The callback that should handle the response from the api
 * @param {number}   packageKey A unique key that a set of messages should have
 */
export var stolptid = (siteid, options = {busFilterActive: false, packageKey: -1, filter: []}) => {
    if (options.packageKey === -1) {
        fetch(url.resrobot(siteid))
        .then(response => _stolptidResponse(response, options.busFilterActive, options.filter, options.maxDepatures));
    } else {
        fetch(url.resrobot(siteid))
        .then(response => _stolptidResponse(response, options.busFilterActive, options.filter, options.maxDepatures, options.packageKey))
        .catch(error => appmessage.appMessageError('ERROR', error, options.packageKey++));
    }
};

var _stolptidResponse = (resp, busFilterActive, filter, maxDepatures, packageKey = -1) => {
    // check for empty response
    if (resp === '{"getdeparturesresult":{}}') {
        appmessage.appMessageError('No rides available', 'Try again later', packageKey++);
        return;
    }

    var response = JSON.parse(resp);
    var deps = response.getdeparturesresult.departuresegment;
    var alldeps = [];

    if (!Array.isArray(deps)) deps = [deps];

    for (var i = 0; i < deps.length; i++){
        var ad = {};
        ad.number = deps[i].segmentid.carrier.number;
        ad.destination = deps[i].direction;
        ad.time = deps[i].departure.datetime.substring(11);
        ad.displayTime = util.determineTimeLeft(ad.time);

        if (deps[i].segmentid.mot['@displaytype'] === 'B') {
            ad.ridetype = cnst.RT_BUS;
        } else {
            ad.ridetype = cnst.RT_UNKNOWN;
        }
        alldeps.push(ad);
    }

    if (_nearbyStations.length === 0) {
        // only filter if filter is actually active
        if (busFilterActive) {
            alldeps = alldeps.filter((ride) => util.filterRides(ride, filter));
        }
    }

    if (packageKey === -1) packageKey = packageKey++;

    var batchLength  = alldeps.length > maxDepatures ? maxDepatures : alldeps.length;
    appmessage.addRide(alldeps.slice(0, batchLength), packageKey);

    Slebble.setLastOptions({
        busFilterActive: busFilterActive,
        filter: filter,
        maxDepatures: maxDepatures,
        packageKey: packageKey
    });

    Slebble.setLastRequest(this);
};

/**
 * Get stations with coordinates from Resrobot api
 * @param {number} latitude   Latitude coordinate for station
 * @param {number} longitude  Longitude coordinate for station
 * @param {Function} callback The callback that should handle the response from the api
 */
export var nearbyStations = (latitude, longitude) => {
    fetch(url.resrobotGeo(longitude, latitude)).then(resp => _GeoResponse(resp));
};

var _GeoResponse = function(resp) {
  //console.log(resp);
  if (resp !== '{"stationsinzoneresult":{}}') {
    var response = JSON.parse(resp);
    var stations = [];
    _nearbyStations = [];
    if (Object.prototype.toString.call( response.stationsinzoneresult.location ) === '[object Array]') {
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
