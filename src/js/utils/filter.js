module.exports = (function() {
	'use strict';

	var cnst = require('./../const.js');

	var filterRides = function (ride, filter) {
		if (ride.ridetype !== cnst.RT_BUS) return true;

		for (var i = filter.length - 1; i >= 0; i--) {
			// only filter buses, else always include
			if (filter[i] === ride.number) return true;
		}
		return false;
	};

	return {
		filterRides: filterRides
	};
}());
