/* eslint strict: 0 */

var fetch = require('../fetch.js').fetch;
var util = require('../util.js');
var cnst = require('../const.js');
var log = require('../util.js').log;

var key = {};
key.resrobot = 'UacUcP0MlG9fZ0j82r1k5he6KXQ6koSS';

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
    return new Promise((resolve, reject) => {
        log('stolptid in');
        fetch(url.resrobot(siteid))
        .then(response => {
            log('stolptid in resp');
            var rides = _stolptidResponse(response, options.busFilterActive, options.filter, options.maxDepatures);
            if (rides === -1) {
                log('reject');
                reject();
            } else {
                log('resolve' +rides);
                resolve(rides);
            }
        });
    });
};

var _stolptidResponse = (resp, busFilterActive, filter, maxDepatures) => {
    // check for empty response
    if (resp === '{"getdeparturesresult":{}}') {
        return -1;
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

    // only filter if filter is actually active
    if (busFilterActive) {
        alldeps = alldeps.filter((ride) => util.filterRides(ride, filter));
    }

    var batchLength  = alldeps.length > maxDepatures ? maxDepatures : alldeps.length;
    var rides = alldeps.slice(0, batchLength);

    if (rides.length > 0) return rides;
    else return -1;
};

/**
 * Get stations with coordinates from Resrobot api
 * @param {number} latitude   Latitude coordinate for station
 * @param {number} longitude  Longitude coordinate for station
 * @param {Function} callback The callback that should handle the response from the api
 */
export var nearbyStations = (latitude, longitude) => {
    return new Promise((resolve, reject) => {
        fetch(url.resrobotGeo(longitude, latitude))
        .then(resp => {
            var stations = _GeoResponse(resp);
            log(stations);
            if (stations === -1) {
                log('reject');
                reject();
            } else {
                log('solving');
                resolve(stations);
            }
        });
    });
};

var _GeoResponse = function(resp) {
    //console.log(resp);
    if (resp !== '{"stationsinzoneresult":{}}') {
        var response = JSON.parse(resp);
        var stations = [];
        var nearbyStations = [];
        if (Array.isArray(response.stationsinzoneresult.location)) {
            var batchLength = response.stationsinzoneresult.location.length > 5 ? 5 : response.stationsinzoneresult.location.length;
            for(var i = 0; i < batchLength; i++) {
                let ad = {};
                ad.from = response.stationsinzoneresult.location[i].name;
                stations.push(ad);
                nearbyStations.push(response.stationsinzoneresult.location[i]['@id']);
            }
        } else {
            let ad = {};
            ad.from = response.stationsinzoneresult.location.name;
            stations.push(ad);
            nearbyStations = [response.stationsinzoneresult.location['@id']];
        }
        return {ids: nearbyStations, names: stations};
    } else {
        return -1;
    }
};
