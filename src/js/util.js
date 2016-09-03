/* eslint strict: 0 */

module.exports = (function() {
	var cnst = require('./const.js');

	var determineTime = function (timeleft) {
		var date = new Date();
		var realHour = date.getHours();
		var realMin = date.getMinutes();
		var zero = '';

		realMin = realMin + timeleft;

		realHour = realHour + Math.floor(realMin / 60);
		realMin = realMin % 60;

		realHour = realHour % 24;

		if (realMin < 10) zero = '0';

		return realHour + ':' + zero + realMin;
	};

	/**
	 * Parse time left for resrobot times
	 * @param time HH:MM
	 * @returns {number}
	 * @private
	 */
	var determineTimeLeft = function (time) {
		if (time === '') return 0;

		var timeHour = parseInt(time.substr(0, 2));
		var timeMin = parseInt(time.substr(3));
		var date = new Date();
		var realHour = date.getHours();
		var realMin = date.getMinutes();

		if (timeHour < realHour) {
			timeHour += 24;
		}

		var hour = timeHour - realHour;
		var min = hour * 60;

		var dMin = timeMin - realMin;

		if (min === 0 && timeMin < realMin) return 0;

		return min + dMin;
	};

	/**
	 * Filter function for rides to be used with array.filter
	 * @param ride        A ride object, se sample in _SLRealtimeCallback
	 * @returns {boolean} Returns true if ride is to be included
	 * @private
	 */
	var filterRides = function (ride, filter) {
		if (ride.ridetype !== cnst.RT_BUS) return true;

		for (var i = filter.length - 1; i >= 0; i--) {
			// only filter buses, else always include
			if (filter[i] === ride.number) return true;
		}
		return false;
	};

	var silent = false;
	var log = function (msg) {
		if (!silent) console.log(msg);
	};

	return {
		determineTime: determineTime,
		determineTimeLeft: determineTimeLeft,
		filterRides: filterRides,
		log: log,
	};
})();