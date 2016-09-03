/* eslint strict: 0 */
/* global trackJs */

var Slebble = require('./slebble.js');
window._trackJs = { token: '9f36ea9a2ea04439907e32f217e1fcc2' };

// This is a polyfill. This is needed to make the iphone work correctly.
window.Image = function() {
    return {};
};

Pebble.addEventListener('ready', function() {
    trackJs.attempt(function() {
        console.log('Running ready event');
        console.log('TrackJs version: ' + trackJs.version);

        var response = localStorage.data;
        if (response !== '' && typeof response === 'string') {
            console.log(localStorage.data);
            response = JSON.parse(localStorage.data);
            Slebble.loadConfig(response);
            var stations = [];
            for (var i = 0; i < response.route.length; i++) {
                var ad = {};
                ad.from = response.route[i].from.replace(/\053/g, ' ');
                stations.push(ad);
            }
            Slebble.addStation(stations, 0);
        } else {
            Slebble.addStation([{
                from: 'No configuration',
            }], 0);
        }
    }, this);
});


Pebble.addEventListener('showConfiguration', function() {
    trackJs.attempt(function() {
        var url = 'https://diesel-ability-711.appspot.com/webconfig/index.html?version=2.0';

        if (localStorage.data) {
            // This makes the iphone return blank page.
            url = url + '&setting=' + localStorage.data;
        }

        Pebble.openURL(url);
    }, this);
});

Pebble.addEventListener('webviewclosed', function(e) {
    trackJs.attempt(function(e) {
        console.log('Webviewclosed');
        console.log(e.response);

        if (e.response === 'reset') {
            localStorage.removeItem('data');
        // The iphone responds with an empty string when settings won't start up.
        // This causes the settings to be removed. Leaving as is because it's better that the apps almost works.
        // } else if (e.response && e.response !== 'CANCELLED' && e.response.substring(0, 12) !== '{"route": []' && e.response !== '{}') {
        } else if (e.response !== 'CANCELLED' && e.response.substring(0, 12) !== '{"route": []' && e.response !== '{}') {
            localStorage.setItem('data', e.response);

            if (localStorage.data) {
                console.log(localStorage.data);
                var response = JSON.parse(localStorage.data);
                Slebble.loadConfig(response);

                var stations = [];
                for (var i = 0; i < response.route.length; i++) {
                    var ad = {};
                    ad.from = response.route[i].from.replace(/\053/g, ' ');
                    stations.push(ad);
                }

                Slebble.addStation(stations, 0);

            }
        }
    }, this, e);
});

Pebble.addEventListener('appmessage', function(e) {
    trackJs.attempt(function(e) {
        /**
        * payload[1] : menu row
        * payload[2] : step, is saying which instruction the watch excpects
        * payload[3] : expected package key
        */
        if (e.payload[2] === 0) {
            if (e.payload[1] !== 0) {
                Slebble.requestRides(e.payload[1] - 1, e.payload[2], e.payload[3]);
            } else {
                Slebble.requestGeoRides(e.payload[3]);
            }
        } else if (e.payload[2] === 1){
            Slebble.requestRides(e.payload[1], e.payload[2], e.payload[3]);
        } else {
            Slebble.requestUpdate(e.payload[3]);
        }
    }, this, e);
});
