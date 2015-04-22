var Slebble = require("./slebble.js");

Pebble.addEventListener('ready',
            function(e) {
              //console.log('ready');
              var response = localStorage.data;
              if (response !== undefined && response !== '') {
                //console.log('has data');
                response = JSON.parse(localStorage.data);
                //console.log('saved data'+JSON.stringify(response));
                Slebble.loadConfig(response);
                var stations = [];
                for(var i = 0; i < response.route.length; i++) {
                  var ad = {};
                  ad.index = i;
                  ad.from = response.route[i].from.replace(/\053/g, ' ');
                  ad.nr = response.route.length;
                  stations.push(ad);
                }
                Slebble.addStation(stations, 0);
              } else {
                var ad = {};
                ad.index = 0;
                ad.from = 'No configuration';
                ad.nr = 1;
                ad = [ad];
                Slebble.addStation(ad, 0);
              }
            });


Pebble.addEventListener('showConfiguration',
            function(e) {
              if (localStorage.data) {
                Pebble.openURL('http://diesel-ability-711.appspot.com/webconfig/index.html?version=2.0' + '&setting=' + localStorage.data);
              }else {
                Pebble.openURL('http://diesel-ability-711.appspot.com/webconfig/index.html?version=2.0');
              }
            });

Pebble.addEventListener('webviewclosed',
            function(e) {
              if (e.response === 'reset') {
                localStorage.removeItem('data');
              } else if (e.response !== 'CANCELLED' && e.response.substring(0, 12) !== '{"route": []' && e.response !== '{}') {
                localStorage.setItem('data', e.response);

                if (localStorage.data) {
                  var response = JSON.parse(localStorage.data);
                  Slebble.loadConfig(response);

                  var stations = [];
                  for(var i = 0; i < response.route.length; i++) {
                    var ad = {};
                    ad.index = i;
                    ad.from = response.route[i].from.replace(/\053/g, ' ');
                    ad.nr = response.route.length;
                    stations.push(ad);
                  }
                  
                  Slebble.addStation(stations, 0);

                }
              }
            });

Pebble.addEventListener('appmessage',
            function(e) {
              if(e.payload[2] === 0) {
                if(e.payload[1] !== 0) {
                  Slebble.requestRides(e.payload[1]-1, 0);
                } else {
                  Slebble.requestGeoRides();
                }
              } else if(e.payload[2] === 1){
                Slebble.requestRides(e.payload[1], e.payload[2]);
              } else {
                Slebble.requestUpdate();
              }
            });