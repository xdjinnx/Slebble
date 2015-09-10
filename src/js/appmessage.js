module.exports = (function(Pebble) {
  'use strict';

/**
* BUG, only one message sent. Pebble waiting for more.
**/
  var _addStation = function(stations, packageKey) {
    if(stations.length < 1)
      return;
    Pebble.sendAppMessage({
        '0': 1,
        '1': stations[0].index,
        '2': stations[0].from,
        '5': stations[0].nr,
        '9': packageKey
      },
      function() {
        console.log("acc");
        stations.shift();
        api.addStation(stations, packageKey);
      },
      function() {
        setTimeout(function(){ api.addStation(stations, packageKey); }, 100);
      }
    );
  };

  var _addRide = function(depatureList, packageKey) {
    if(depatureList.length < 1)
      return;
    Pebble.sendAppMessage({
        '0': 2,
        '1': depatureList[0].index,
        '3': depatureList[0].time,
        '4': depatureList[0].number + ' ' + depatureList[0].destination,
        '5': depatureList[0].nr,
        '6': depatureList[0].displayTime,
        '9': packageKey
      },
      function() {
        depatureList.shift();
        _addRide(depatureList, packageKey);
      },
      function() {
        setTimeout(function(){ _addRide(depatureList, packageKey); }, 100);
      }
    );
  };

  var _appMessageError = function(title, subtitle, packageKey) {
    console.log('sending error '+title+' '+subtitle);
    Pebble.sendAppMessage({
        '0': 3,
        '1': 0,
        '5': 1,
        '7': title,
        '8': subtitle,
        '9': packageKey
      },
      function() {},
      function() {
        setTimeout(function(){ _appMessageError(title, subtitle, packageKey); }, 100);
      }
    );
  };

  return {
  	addStation: _addStation,
  	addRide: _addRide,
  	appMessageError: _appMessageError
  };

})(Pebble);