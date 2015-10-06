module.exports = (function() {
    'use strict';

    var appmessage = require('./appmessage.js');
    var slApi = require('./apis/sl.js');
    var resrobot = require('./apis/resrobot.js');

    var _provider = '';
    var _config = {};
    var _maxDepatures = 15;
    var _queryIndex = 0;
    var _queryId = 0;
    var _locationOptions = {'timeout': 15000, 'maximumAge': 60000 };
    var _packageKey = 1;
    var _nearbyStations = [];
    var _lastRequest;
    var _lastOptions = {};

    /**
     * Load config object
     * @param config Json object
     */
    var _loadConfig = (config) => {
        console.log('Loading config..');
        _config = config;
        _provider = config.provider;
        _maxDepatures = parseInt(config.maxDepatures);
    };

    /**
     * Request rides
     * @param index Station index
     */
     var _requestRides = (index, step) => {
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
            resrobot.stolptid(_queryId,{
                busFilterActive: _config.route[_queryIndex].busFilterActive,
                filter: _config.route[_queryIndex].filter,
                maxDepatures: _maxDepatures
            });
        }

    };

    var _requestUpdate = () => {
        _lastOptions.packageKey = _packageKey - 1;
        _lastRequest(_lastOptions);
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
        resrobot.nearbyStations(coordinates.latitude, coordinates.longitude);
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
    // open.__testonly__._slTimeSort = _slTimeSort;
    /* end-test-block */

    return open;

})();
