/* eslint strict: 0 */

module.exports = (function() {
    /**
     * Send a set of stations to the pebble watch
     * @param {Object[]} stations Set of station objects
     * @param {number} packageKey A unique key that a set of messages should have
     */
    var addStation = function(stations, packageKey) {
        if (stations.length < 1) return;
        Pebble.sendAppMessage({
                '0': packageKey,
                '1': 0,
                '2': stations.length == 1 ? 1 : 0,
                '3': stations[0].from
            },
            function() {
                stations.shift();
                addStation(stations, packageKey);
            },
            function() {
                setTimeout(function(){ addStation(stations, packageKey); }, 100);
            }
        );
    };

    /**
     * Send a set of rides to the pebble watch
     * @param {Object[]} depatureList Set of ride objects
     * @param {number} packageKey A unique key that a set of messages should have
     */
    var addRide = function(depatureList, packageKey) {
        if (depatureList.length < 1) return;
        Pebble.sendAppMessage({
                '0': packageKey,
                '1': 1,
                '2': depatureList.length == 1 ? 1 : 0,
                '3': depatureList[0].displayTime,
                '4': depatureList[0].time,
                '5': depatureList[0].number + ' ' + depatureList[0].destination
            },
            function() {
                depatureList.shift();
                addRide(depatureList, packageKey);
            },
            function() {
                setTimeout(function(){ addRide(depatureList, packageKey); }, 100);
            }
        );
    };

    /**
     * Send a error message to the pebble watch
     * @param {string} title The title of the message or bigger text
     * @param {string} subtitle The subtitle of the message or smaller text
     * @param {number} packageKey A unique key that a set of messages should have
     */
    var appMessageError = function (title, subtitle, packageKey) {
        //console.log('sending error '+title+' '+subtitle);
        Pebble.sendAppMessage({
                '0': packageKey,
                '1': title,
                '2': subtitle,
                '3': 0,
                '4': '',
                '5': 1
            },
            function () {
            },
            function () {
                setTimeout(function () {
                    appMessageError(title, subtitle, packageKey);
                }, 100);
            }
        );
    };

    return {
        addStation: addStation,
        addRide: addRide,
        appMessageError: appMessageError,
    };
})();