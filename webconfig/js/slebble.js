/* global -$, purl, alert */
/* exported Slebble */

var Slebble = (function(){
  'use strict';

  var _currentPage = document.querySelector('#startPage');
  var _stationJson = [];
  var _resultsBox = document.querySelector('#results');

  var _searchField = document.querySelector('#search-field');
  var _adding = document.querySelector('#adding');
  var _filterAdding = document.querySelector('#filterAdding');
  var _filterField = document.querySelectorAll('.filter-field');
  var _filterEnabled = document.querySelectorAll('.filter-field');
  var _departureRange = document.querySelector('#depature-range');
  var _provider = document.querySelector('#provider');

  var DEBUG = false;

  function log(msg) {
    if (DEBUG)
      console.log(msg);
  }

  function _changePage(page) {
    _currentPage.style.display = 'none';

    var newPage = document.querySelector('#'+page);
    newPage.style.display = 'block';

    _currentPage = newPage;
  }

  function version() {
    return purl().param('version');
  }

  /**
   * Returns url param in production and local if DEBUG is set
   * @returns {string} Stringifyed json data
   * @private
   */
  function _getOldSettingJson() {
    if (DEBUG)
      return localStorage.data;
    else
      return purl().param('setting');
  }

  function _checkVersion() {
    if (version() === '1.1.0') {
      var startPage = document.querySelector('#startPage');
      startPage.innerHTML = '<div class="highlight-module  highlight-module--right   highlight-module--learning"><div class="highlight-module__container  icon-exclamation "><div class="highlight-module__content   g-wide--push-1 g-wide--pull-1  g-medium--pull-1   "><p class="highlight-module__title"> New update</p><p class="highlight-module__text"> There is or will be a update very soon for this app. Unload and load the app at My Pebble and hope for a new update! </p></div></div></div>'+startPage.innerHTML;
    }
  }

  function _getOldDepartures() {

    var response = _getOldSettingJson();

    if (response !== undefined && response !== '') {
      response = JSON.parse(response);

      _stationJson = response.route;

      document.querySelector('#depature-range').value = response.maxDepatures;
      api.changePerformance();
      _provider.value = response.provider;

      _updateStartPageAndFilterPage();
    }
  }

  /**
   * Render list on start and filter pages
   * @private
   */
  function _updateStartPageAndFilterPage() {
    _adding.innerHTML = '';

    if(_stationJson.length === 0) {
      _adding.innerHTML = '<p>No stations set</p>';
      _filterAdding.innerHTML ='<p>No stations set</p>';
    }

    for(var i = 0; i < _stationJson.length; i++) {
      _adding.innerHTML += '<li><span class="list__item">' + _stationJson[i].from + '</span><a class="deleteIcon" onclick="Slebble.removeFrom(this)" data-index="'+i+'"><i class="icon icon-close"></i></a></li>';
    }

    _filterAdding.innerHTML = '';
    for(i = 0; i < _stationJson.length; i++) {
      _filterAdding.innerHTML += '<li>' + _stationJson[i].from + '</li><span class="filterSpan">Bus filter </span><input type="text" class="filter-field"  value="'+ _stationJson[i].filter.join(', ') +'" data-index="'+i+'" '+(_stationJson[i].busFilterActive === 'true'?'':'disabled') +'/><br><label for="filterEnable'+i+'" class="station-filter"><input type="checkbox" id="filterEnable'+i+'" class="filter-enabled" '+(_stationJson[i].busFilterActive === 'true'?'checked':'')+' data-index="'+i+'"/>Enable filter</label></div>';
    }

    _rebindFilterEvent();
  }

  /**
   * Bind the onchange events on filter text fields.
   * @private
   */
  function _rebindFilterEvent() {
    if (_stationJson!==undefined && _stationJson.length > 0) {
      _filterField = document.querySelectorAll('.filter-field');
      for (var i = 0; i<_filterField.length; i++){
        _filterField[i].onchange = _filterFieldHandler;
      }

      _filterEnabled = document.querySelectorAll('.station-filter');
      for (var j = 0; j<_filterEnabled.length; j++){
        _filterEnabled[j].onclick = _filterEnabledHandler;
      }
    }
  }

  var _filterFieldHandler = function(e) {
    log(e);
    var ele = e.srcElement;
    var index = ele.getAttribute('data-index');
    _stationJson[index].filter = ele.value.split(', ');
  };

  var _filterEnabledHandler = function(e) {
    log(e);
    var ele = e.srcElement;
    var index = ele.getAttribute('data-index');
    _stationJson[index].busFilterActive = (ele.checked === true)?'true':'false';
    _filterField[index].disabled = _stationJson[index].busFilterActive !== 'true';
  };

  var _removeClass = function (el, className) {
    if (el.classList)
      el.classList.remove(className);
    else
      el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
  };

  var _addClass = function(el, className){
    if (el.classList)
      el.classList.add(className);
    else
      el.className += ' ' + className;
  };

  var _hasClass = function(el, className) {
    if (el.classList)
      return el.classList.contains(className);
    else
      return new RegExp('(^| )' + className + '( |$)', 'gi').test(el.className);
  };

  function getMaxDepartures() {
    return parseInt(_departureRange.value);
  }

  /**
   * Create the JSON to be send back to pebble app
   * @returns {string}
   */
  function getSettingJson() {

    var settings = {};
    settings.route = _stationJson;
    settings.maxDepatures = getMaxDepartures();
    settings.provider = _provider.value;

    return JSON.stringify(settings);
  }

  function _clearSearchField() {
    _searchField.value = '';
  }

  function _toggleAjaxLoaderIcon() {
    var icon = document.querySelector('#search-btn').children[0];
    if (_hasClass(icon, 'mglass')){
      _removeClass(icon, 'mglass');
      _addClass(icon, 'ajax-loader');

    } else {
      _removeClass(icon, 'ajax-loader');
      _addClass(icon, 'mglass');
    }
  }

  /**
   * Send search query to our backend
   */
  function _stationSearch() {
    _resultsBox.innerHTML = '';

    var from = document.querySelector('#search-field').value;
    if (from.length<2)
      return;

    _toggleAjaxLoaderIcon();
    var response;

    var provider = _provider.value;

    var url = 'http://diesel-ability-711.appspot.com/'+provider+'/';

    if (DEBUG) {
      url = 'http://localhost:8080/'+provider+'/';
    }

    var req = new XMLHttpRequest();
    req.open('GET', url + from, true);
    req.onload = function() {

      if (req.readyState === 4) {

        _toggleAjaxLoaderIcon();

        if(req.status === 200) {

          response = JSON.parse(req.responseText);
          var resultList = response.result.reverse();
          for(var i = resultList.length-1; i >= 0; i--) {
            var station = resultList[i];
            _resultsBox.innerHTML += '<li><a type="button" class="list__item" onclick="Slebble.add(this);" data-id="'+station.id+'">' + station.name + '</a></li>';
          }
        } else {
          document.querySelector('#results').innerHTML = '<p>Request status: ' + req.status + '<p>';
          console.log('Error');
          console.log(req.status);
        }
      }
    };
    req.send(null);
  }

   var _submitSettings = function() {
     var location = 'pebblejs://close#' + encodeURIComponent(getSettingJson());
      log('Warping to: ' + location);
      log(getSettingJson());
      if (DEBUG) {
        localStorage.data = getSettingJson();
        alert('Settings saved');
      } else {
        document.location = location;
      }
   };

  var api = {};

  /**
   * Fires when performance slider change to change the colour of the speed icon
   */
  api.changePerformance = function() {
    var prefDisp = document.querySelector('#performance-display');
    _removeClass(prefDisp, 'theme--user-input');
    _removeClass(prefDisp, 'theme--multi-device-layouts');
    _removeClass(prefDisp, 'theme--introduction-to-media');

    var depatureRange = document.querySelector('#depature-range');
    if(parseInt(depatureRange.value) === 15) {
      _addClass(prefDisp, 'theme--user-input');
    }
    if(parseInt(depatureRange.value) < 15) {
      _addClass(prefDisp, 'theme--multi-device-layouts');
    }
    if(parseInt(depatureRange.value) > 15) {
      _addClass(prefDisp, 'theme--introduction-to-media');
    }

    document.querySelector('#depature-number').textContent = depatureRange.value;
  };

  /**
   * Handle add click from search page
   * @param elem
   */
  api.add = function(elem) {
    var station = {};
    station.from = elem.innerHTML;
    station.locationid = elem.getAttribute('data-id');
    station.filter = [];
    station.busFilterActive = 'false';
    _stationJson[_stationJson.length] = station;

    _updateStartPageAndFilterPage();

    _changePage('startPage');
    _clearSearchField();
  };

  // Handle enter-key press in search field
  api.enterKeyPress = function(event) {
    if(event.keyCode === 13) {
      _stationSearch();
    }
  };

  api.removeFrom = function(elem) {
    _stationJson.splice(elem.getAttribute('data-index'), 1);
    _updateStartPageAndFilterPage();
  };

  /**
   * To be run when site is loaded
   */
  api.boot = function() {
    document.querySelector('#startLink').onclick = function() {
      _changePage('startPage');
    };

    document.querySelector('#searchLink').onclick = function() {
      _changePage('searchPage');
    };

    document.querySelector('#filterLink').onclick = function() {
      _changePage('filterPage');
    };

    document.querySelector('#cancel').onclick = function() {
      if (DEBUG)
        alert('closing...');
      else
        document.location = 'pebblejs://close';
    };

    document.querySelector('#reset').onclick = function() {
      if (DEBUG)
        alert('resetting stuff');
      else
        document.location = 'pebblejs://close#reset';
    };

    document.querySelector('#submit').onclick = _submitSettings;

    document.querySelector('#submit-toolbar').onclick = _submitSettings;

    document.querySelector('#search-btn').onclick = function(elem) {
      elem.preventDefault();
      _stationSearch();
    };

    _provider.onchange = function() {
      _stationJson = [];
      _updateStartPageAndFilterPage();
    };

    _changePage('startPage');
    _checkVersion();
    _getOldDepartures();
    _rebindFilterEvent();
  };

  return api;

})();
