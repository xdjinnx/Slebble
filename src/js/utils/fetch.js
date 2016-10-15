module.exports = (function() {
	var Promise = require('promise');

	/**
	 * A simple fetch polyfill
	 * @param  {string} url     Url to hit
	 * @param  {object} options Options
	 * @return {Promise}
	 */
	var fetch = function (url, options) {
		return new Promise(function (resolve, reject) {
			// Do the usual XHR stuff
			var req = new XMLHttpRequest();
			if (options !== undefined && options.method !== undefined) {
				req.open(options.method, url);
			} else {
				req.open('GET', url, true);
			}

			req.setRequestHeader('Authorization', 'Bearer ' + localStorage.token);
			if (options !== undefined && options.headers !== undefined) {
				options.headers.forEach(function (h) {
					req.setRequestHeader(h.name, h.content)
				});
			}

			if (options !== undefined && options.json !== undefined) {
				req.responseType = 'json';
			}

			req.onload = function () {
				// This is called even on 404 etc
				// so check the status
				if (req.status.toString().match(/2../)) {
					// Resolve the promise with the response text
					resolve(req.responseText);
				} else {
					// Otherwise reject with the status text
					// which will hopefully be a meaningful error
					reject(Error(req.statusText));
				}
			};

			// Handle network errors
			req.onerror = function () {
				reject(Error('Network Error'));
			};

			// Make the request
			if (options !== undefined && options.body !== undefined) {
				req.send(options.body);
			} else {
				req.send();
			}
		});
	};

	return {
		fetch: fetch
	};
}());
