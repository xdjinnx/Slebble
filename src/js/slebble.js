module.exports = (function() {
    'use strict';

    var appmessage = require('./appmessage.js');
    var slApi = require('./apis/sl.js');
    var resrobot = require('./apis/resrobot.js');
    var objectAssign = require('object-assign');
    var log = require('./util.js').log;

    var _provider = '';
    var _config = {};
    var _maxDepatures = 15;
    var _queryIndex = 0;
    var _queryId = 0;
    var _locationOptions = {timeout: 15000, maximumAge: 60000 };
    var _packageKey = 1;
    var _nearbyStations = [];
    var _lastQueryId;

    /**
     * Load config object
     * @param config Json object
     */
    var _loadConfig = (config) => {
        log('Loading config..');
        _config = config;
        _provider = config.provider;
        _maxDepatures = parseInt(config.maxDepatures);
    };

    /**
     * Request rides
     * @param index Station index
     */
     var _requestRides = (index, step = 0) => {
        _queryIndex = index;
        log('step '+step);
        if (step !== 1) {
            _queryId = _config.route[index].locationid;
            _nearbyStations = [];
        } else {
            _queryId = _nearbyStations[index];
        }

        log(_queryId);
        if (_provider === 'sl' && step !== 1) { // if step is 1 request if from nearby
            slApi.realtime(_queryId, {
                busFilterActive: _config.route[_queryIndex].busFilterActive,
                filter: _config.route[_queryIndex].filter,
                maxDepatures: _maxDepatures
            }).then((rides) => {
                _lastQueryId = _queryId;
                appmessage.addRide(rides, _packageKey);
            }).catch(() => appmessage.appMessageError('No rides available', 'Try again later', _packageKey++));
        } else {
            let busFilterActive = step === 1 ? false : _config.route[_queryIndex].busFilterActive;
            log('stolptid step '+step);
            resrobot.stolptid(_queryId, {
                busFilterActive: step === 1 ? busFilterActive : false,
                filter: _config.route[_queryIndex].filter,
                maxDepatures: _maxDepatures
            }).then((rides) => {
                _lastQueryId = _queryId;
                rides.forEach(r => log(r));
                appmessage.addRide(rides, _packageKey);
            }).catch(() => appmessage.appMessageError('No rides available', 'Try again later', _packageKey++));
        }

    };

    var _requestUpdate = () => {
        _requestRides(_lastQueryId);
        // _lastOptions.packageKey = _packageKey - 1;
    };

    var _requestGeoRides = () => {
        navigator.geolocation.getCurrentPosition(_locationSuccess, _locationError, _locationOptions);
    };

    /**
     * Callback from location service on success
     * @param pos
     * @private
     */
    var _locationSuccess = (pos) => {
        var coordinates = pos.coords;
        resrobot.nearbyStations(coordinates.latitude, coordinates.longitude)
        .then((stations) => {
            objectAssign(_nearbyStations, stations.ids);
            appmessage.addStation(stations.names, _packageKey++);
        }).catch(() => appmessage.appMessageError('No nearby stations', '', _packageKey++));
    };

    /**
     * Callback from location service on fail
     * @param err
     * @private
     */
    var _locationError = (err) => {
        console.warn('location error (' + err.code + '): ' + err.message);
        appmessage.appMessageError('Location error', 'Can\'t get your location', _packageKey++);
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
