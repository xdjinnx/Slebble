module.exports = (function() {
    'use strict';

    var appmessage = require('./appmessage.js');
    var slApi = require('./apis/sl.js');
    var resrobot = require('./apis/resrobot2.js');
    var objectAssign = require('object-assign');
    var log = require('./util.js').log;

    var _provider = '';
    var _config = {};
    var _maxDepatures = 15;
    var _locationOptions = {timeout: 15000, maximumAge: 60000};
    var _nearbyStations = [];
    var _lastIndex;

    /**
     * Load config object
     * @param config Json object
     */
    var _loadConfig = function(config) {
        log('Loading config..');
        _config = config;
        _provider = config.provider;
        _maxDepatures = parseInt(config.maxDepatures);
    };

    /**
     * Request rides
     * @param index Station index
     */
     var _requestRides = function(index, step, expectedPackageKey) {
        if (!step) {
            step = 0;
        }
        
        log('step ' + step);
        log('expectedPackageKey '+ expectedPackageKey);
        var _queryId;
        if (step === 1 || (step === 2 && 0 < _nearbyStations.length)) {
            _queryId = _nearbyStations[index];
        } else {
            _queryId = _config.route[index].locationid;
            _nearbyStations = [];
        }

        log(_queryId);
        if (_provider === 'sl' && 0 === _nearbyStations.length) { // if step is 1 request if from nearby
            slApi.realtime(_queryId, {
                busFilterActive: _config.route[index].busFilterActive,
                filter: _config.route[index].filter,
                maxDepatures: _maxDepatures
            }).then(function(rides) {
                _lastIndex = index;
                appmessage.addRide(rides, expectedPackageKey);
            }).catch(function() {
                appmessage.appMessageError('No rides available', 'Try again later', expectedPackageKey);
            });
        } else {
            let busFilterActive = 0 < _nearbyStations.length ? false : _config.route[index].busFilterActive;
            let busFilter = 0 < _nearbyStations.length ? [] : _config.route[index].filter;
            log('stolptid step '+step);
            resrobot.stolptid(_queryId, {
                busFilterActive: busFilterActive,
                filter: busFilter,
                maxDepatures: _maxDepatures
            }).then(function(rides) {
                _lastIndex = index;
                appmessage.addRide(rides, expectedPackageKey);
            }).catch(function() {
                appmessage.appMessageError('No rides available', 'Try again later', expectedPackageKey)
            });
        }

    };

    var _requestUpdate = function(expectedPackageKey) {
        _requestRides(_lastIndex, 2, expectedPackageKey);
    };

    var locationVariable = 0;
    var _requestGeoRides = function(expectedPackageKey) {
        locationVariable = expectedPackageKey;
        navigator.geolocation.getCurrentPosition(_locationSuccess, _locationError, _locationOptions);
    };

    /**
     * Callback from location service on success
     * @param pos
     * @private
     */
    var _locationSuccess = function(pos) {
        var coordinates = pos.coords;
        resrobot.nearbyStations(coordinates.latitude, coordinates.longitude)
        .then(function(stations) {
            objectAssign(_nearbyStations, stations.ids);
            appmessage.addStation(stations.names, locationVariable);
        }).catch(function() {
            appmessage.appMessageError('No nearby stations', '', locationVariable)
        });
    };

    /**
     * Callback from location service on fail
     * @param err
     * @private
     */
    var _locationError = function(err) {
        console.warn('location error (' + err.code + '): ' + err.message);
        appmessage.appMessageError('Location error', 'Can\'t get your location', locationVariable);
    };

    var open = {
        addStation: appmessage.addStation,
        requestRides: _requestRides,
        requestUpdate: _requestUpdate,
        loadConfig: _loadConfig,
        requestGeoRides: _requestGeoRides
    };

    /* test-block */
    open.__testonly__ = {};
    // open.__testonly__._slTimeSort = _slTimeSort;
    /* end-test-block */

    return open;

})();
