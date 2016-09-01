/* eslint strict: 0 */

var Promise = require('promise');

var fetch = require('../fetch.js').fetch;
var util = require('../util.js');
var cnst = require('../const.js');
var log = require('../util.js').log;

var key = {};
key.resrobot2 = 'dc778c95-e014-472d-ae19-a2bf0ffa04c7';
key.resGeo = '77697c18-628a-49ec-a6de-c194ca16cbcb';

var url = {};
url.resrobot2 = function(locationid) {
  return 'https://api.resrobot.se/departureBoard.json?key=' + key.resrobot2 + '&id=' + locationid + '&maxJourneys=40';
};
url.resrobotGeo = function(long, lat) {
  return 'https://api.resrobot.se/location.nearbystops.json?key=' + key.resGeo + '&originCoordLat=' + lat + '&originCoordLong=' + long + '&maxNo=5';
};


/**
 * Get depatures from Resrobot stolptidstabeller 2 api
 *
 * @param {number}   siteid     The unique id for a station
 * @param {Function} callback   The callback that should handle the response from the api
 * @param {number}   packageKey A unique key that a set of messages should have
 */
export var stolptid = function(siteid, options) {
    if (!options) {
        options = {busFilterActive: false, packageKey: -1, filter: []};
    }

    return new Promise(function (resolve, reject) {
        log('stolptid in');
        fetch(url.resrobot2(siteid))
        .then(function(response) {
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

var _stolptidResponse = function(resp, busFilterActive, filter, maxDepatures) {
    // check for empty response
    if (resp === '{}') {
        return -1;
    }

    var response = JSON.parse(resp);
    var alldeps = [];

    response.Departure.forEach(function(element, index, array){
		var ad = {};
        ad.number = element.name.split(" ").pop();
        ad.destination = element.direction;
        var time = element.rtTime === undefined ? element.time : element.rtTime;
        ad.time = time.substring(0, 5);
        ad.displayTime = util.determineTimeLeft(ad.time);

        if (element.transportCategory === 'BLT') {
            ad.ridetype = cnst.RT_BUS;
        } else {
            ad.ridetype = cnst.RT_UNKNOWN;
        }
        if(ad.displayTime <= 120) {
        	alldeps.push(ad);
        }

    });

    // only filter if filter is actually active
    if (busFilterActive === 'true') {
        alldeps = alldeps.filter(function(ride) {
            util.filterRides(ride, filter)
        });
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
export var nearbyStations = function(latitude, longitude) {
    return new Promise(function(resolve, reject) {
        fetch(url.resrobotGeo(longitude, latitude))
        .then(function(resp) {
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
    if (resp !== '{}') {
        var response = JSON.parse(resp);
        var stations = [];
        var nearbyStations = [];
        response.StopLocation.forEach(function(element, index, array){
        	let ad = {};
            ad.from = element.name;
            stations.push(ad);
            nearbyStations.push(element.id);
        });
        return {ids: nearbyStations, names: stations};
    } else {
        return -1;
    }
};
