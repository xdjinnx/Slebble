module.exports = (function() {
    var Promise = require('promise');

    var fetch = require('../utils/fetch.js').fetch;
    var timeFunctions = require('../utils/time.js');
    var cnst = require('../const.js');

    var key = {};
    key.resrobot2 = 'dc778c95-e014-472d-ae19-a2bf0ffa04c7';
    key.resGeo = '77697c18-628a-49ec-a6de-c194ca16cbcb';

    var url = {};
    url.resrobot2 = function (locationid) {
        return 'https://api.resrobot.se/departureBoard.json?key=' + key.resrobot2 + '&id=' + locationid + '&maxJourneys=40';
    };
    url.resrobotGeo = function (long, lat) {
        return 'https://api.resrobot.se/location.nearbystops.json?key=' + key.resGeo + '&originCoordLat=' + lat + '&originCoordLong=' + long + '&maxNo=5';
    };


    /**
     * Get depatures from Resrobot stolptidstabeller 2 api
     *
     * @param {number}   siteid     The unique id for a station
     * @param {Function} callback   The callback that should handle the response from the api
     * @param {number}   packageKey A unique key that a set of messages should have
     */
    var stolptid = function (siteid, options) {
        if (!options) {
            options = {busFilterActive: false, packageKey: -1, filter: []};
        }

        return new Promise(function (resolve, reject) {
            fetch(url.resrobot2(siteid))
                .then(function (response) {
                    var rides = stolptidResponse(response, options.busFilterActive, options.filter, options.maxDepatures);
                    if (rides === -1) {
                        reject();
                    } else {
                        resolve(rides);
                    }
                });
        });
    };

    var stolptidResponse = function (resp, busFilterActive, filter, maxDepatures) {
        // check for empty response
        if (resp === '{}') {
            return -1;
        }

        var response = JSON.parse(resp);
        var alldeps = [];

        response.Departure.forEach(function (element, index, array) {
            var ad = {};
            ad.number = element.name.split(" ").pop();
            ad.destination = element.direction;
            var time = element.rtTime === undefined ? element.time : element.rtTime;
            ad.time = time.substring(0, 5);
            ad.displayTime = timeFunctions.determineTimeLeft(ad.time);

            if (element.transportCategory === 'BLT') {
                ad.ridetype = cnst.RT_BUS;
            } else {
                ad.ridetype = cnst.RT_UNKNOWN;
            }
            if (ad.displayTime <= 120) {
                alldeps.push(ad);
            }

        });

        if (busFilterActive === 'true') {
            alldeps = alldeps.filter(function (ride) {
                return filterRides(ride, filter)
            });
        }

        var batchLength = alldeps.length > maxDepatures ? maxDepatures : alldeps.length;
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
    var nearbyStations = function (latitude, longitude) {
        return new Promise(function (resolve, reject) {
            fetch(url.resrobotGeo(longitude, latitude))
                .then(function (resp) {
                    var stations = _GeoResponse(resp);
                    if (stations === -1) {
                        reject();
                    } else {
                        resolve(stations);
                    }
                });
        });
    };

    var _GeoResponse = function (resp) {
        if (resp !== '{}') {
            var response = JSON.parse(resp);
            var stations = [];
            var nearbyStations = [];
            response.StopLocation.forEach(function (element, index, array) {
                var ad = {};
                ad.from = element.name;
                stations.push(ad);
                nearbyStations.push(element.id);
            });
            return {ids: nearbyStations, names: stations};
        } else {
            return -1;
        }
    };

    var filterRides = function (ride, filter) {
        if (ride.ridetype !== cnst.RT_BUS) return true;

        for (var i = filter.length - 1; i >= 0; i--) {
            // only filter buses, else always include
            if (filter[i] === ride.number) return true;
        }
        return false;
    };

    return {
        nearbyStations: nearbyStations,
        stolptid: stolptid
    };
})();