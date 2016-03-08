/* eslint strict: 0 */

var Promise = require('promise');

var fetch = require('../fetch.js').fetch;
var util = require('../util.js');
var cnst = require('../const.js');

var key = {};
key.slReal3 = '190079364ffe4e278f7e27dabd6dce6c';

var urlSlReal3 = (locationid) => {
    //return 'https://api.sl.se/api2/realtimedepartures.json?key=' + _key.slReal3 + '&siteid=' + locationid + '&timewindow=120';
    // sl has spoky cert?
    return 'http://api.sl.se/api2/realtimedepartures.json?key=' + key.slReal3 + '&siteid=' + locationid + '&timewindow=120';
};


var _formatDiaplayTime = (departure) => {
    var dt = departure.DisplayTime;

    if (dt.substring(dt.length - 3, dt.length) !== 'min') {
        return util.determineTimeLeft(dt);
    } else {
        return parseInt(dt.substring(0, dt.length - 4));
    }
};

var _formatTime = (departure, ad) => {
    var dt = departure.DisplayTime;

    if (dt.substring(dt.length-3, dt.length) !== 'min') {
        return dt;
    } else {
        return util.determineTime(ad.displayTime);
    }
}

/**
 * Get depatures from SLReal3 api
 *
 * @param {number}   siteid     The unique id for a station
 * @param {Function} callback   The callback that should handle the response from the api
 * @param {number}   packageKey A unique key that a set of messages should have
 */
export var realtime = (siteid, options = {busFilterActive: false, filter: []}) => {
    return new Promise((resolve, reject) => {
        fetch(urlSlReal3(siteid))
        .then(response => {
            var rides = _realtimeReponse(response, options.busFilterActive, options.filter, options.maxDepatures);
            if (rides === -1) {
                reject();
            } else {
                resolve(rides);
            }
        });
    });
};

var _realtimeReponse = (resp, busFilterActive, filter, maxDepatures) => {
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

    for (var i = 0; i < deps.length; i++) {
        var ad = {};
        ad.number = deps[i].LineNumber;
        if(deps[i].DisplayTime === 'Nu') {
            ad.displayTime = 0;
            ad.time = util.determineTime(0);
        }
        else {
            ad.displayTime = _formatDiaplayTime(deps[i]);
            ad.time = _formatTime(deps[i], ad);
        }
        ad.destination = deps[i].Destination;

        if (deps[i].TransportMode === 'BUS') {
            ad.ridetype = cnst.RT_BUS;
        } else {
            ad.ridetype = cnst.RT_UNKNOWN;
        }
        alldeps.push(ad);
    }

    // only filter if filter is actually active
    if (busFilterActive === 'true') {
        alldeps = alldeps.filter((ride) => util.filterRides(ride, filter));
    }

    alldeps = alldeps.sort((a, b) => {
        if (a.displayTime === b.displayTime) return 0;
        if (a.displayTime < b.displayTime) return -1;
        return 1;
    });

    if (alldeps.length < 1) {
        return -1;
    }

    var numberToAdd = alldeps.length > maxDepatures ? maxDepatures:alldeps.length;
    return alldeps.slice(0, numberToAdd);
};
