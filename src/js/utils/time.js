module.exports = (function() {
	'use strict';

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
	 * Parse time left.
	 * @param time HH:MM
	 * @returns {number}
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

	return {
		determineTime: determineTime,
		determineTimeLeft: determineTimeLeft
	};
}());
