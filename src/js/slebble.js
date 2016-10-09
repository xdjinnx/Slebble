module.exports = (function() {
    'use strict';

    var appmessage = require('./appmessage.js');
    var slApi = require('./apis/sl.js');
    var resrobot = require('./apis/resrobot2.js');
    var objectAssign = require('object-assign');

    var provider = '';
    var config = {};
    var maxDepatures = 15;
    var locationOptions = {timeout: 15000, maximumAge: 60000};
    var nearbyStations = [];
    var lastIndex;

    function loadConfig(c) {
        config = c;
        provider = config.provider;
        maxDepatures = parseInt(config.maxDepatures);
    }

    function clearNearbyStation() {
        nearbyStations = [];
    }

    function requestRides(index, expectedPackageKey) {
        var queryId;
        if (nearbyStations.length > 0)  {
            queryId = nearbyStations[index];
        } else {
            queryId = config.route[index].locationid;
        }

        if (provider === 'sl' && 0 === nearbyStations.length) {
            slApi.realtime(queryId, {
                busFilterActive: config.route[index].busFilterActive,
                filter: config.route[index].filter,
                maxDepatures: maxDepatures
            }).then(function(rides) {
                lastIndex = index;
                appmessage.addRide(rides, expectedPackageKey);
            }).catch(function() {
                appmessage.appMessageError('No rides available', 'Try again later', expectedPackageKey);
            });
        } else {
            var busFilterActive = 0 < nearbyStations.length ? false : config.route[index].busFilterActive;
            var busFilter = 0 < nearbyStations.length ? [] : config.route[index].filter;
            resrobot.stolptid(queryId, {
                busFilterActive: busFilterActive,
                filter: busFilter,
                maxDepatures: maxDepatures
            }).then(function(rides) {
                lastIndex = index;
                appmessage.addRide(rides, expectedPackageKey);
            }).catch(function() {
                appmessage.appMessageError('No rides available', 'Try again later', expectedPackageKey)
            });
        }
    }

    function requestUpdate(expectedPackageKey) {
        requestRides(lastIndex, expectedPackageKey);
    }

    var locationVariable = 0;
    function requestGeoRides(expectedPackageKey) {
        locationVariable = expectedPackageKey;
        navigator.geolocation.getCurrentPosition(locationSuccess, locationError, locationOptions);
    }

    function locationSuccess(pos) {
        var coordinates = pos.coords;
        resrobot.nearbyStations(coordinates.latitude, coordinates.longitude)
            .then(function(stations) {
                objectAssign(nearbyStations, stations.ids);
                appmessage.addStation(stations.names, locationVariable);
            }).catch(function() {
            appmessage.appMessageError('No nearby stations', '', locationVariable)
        });
    }

    function locationError(err) {
        console.warn('location error (' + err.code + '): ' + err.message);
        appmessage.appMessageError('Location error', 'Can\'t get your location', locationVariable);
    }

    var open = {
        addStation: appmessage.addStation,
        requestRides: requestRides,
        requestUpdate: requestUpdate,
        loadConfig: loadConfig,
        requestGeoRides: requestGeoRides,
        clearNearbyStation: clearNearbyStation
    };

    /* test-block */
    open.__testonly__ = {};
    // open.__testonly__._slTimeSort = _slTimeSort;
    /* end-test-block */

    return open;

})();
