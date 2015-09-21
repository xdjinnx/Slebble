jest.dontMock('../src/js/api.js');
var api = require('../src/js/api.js');

describe('requestSLRealtime', function() {
  it('Check if requestSLRealtime works', function() {

 	  XMLHttpRequest = XHRMockObject;

    var mockCallback = jest.genMockFunction();
    api.requestSLRealtime(12345, mockCallback);
    api.requestSLRealtime(12345, mockCallback, 5);

    expect(mockCallback.mock.calls.length).toBe(2);
  });
});

describe('requestResrobot', function() {
  it('Check if requestResrobot works', function() {

 	  XMLHttpRequest = XHRMockObject;

    var mockCallback = jest.genMockFunction();
    api.requestResrobot(12345, mockCallback);
    api.requestResrobot(12345, mockCallback, 5);

    expect(mockCallback.mock.calls.length).toBe(2);
  });
});

describe('requestNearbyStations', function() {
  it('Check if requestNearbyStations works', function() {

 	  XMLHttpRequest = XHRMockObject;

    var mockCallback = jest.genMockFunction();
    api.requestNearbyStations(5, 5, mockCallback);

    expect(mockCallback.mock.calls.length).toBe(1);
  });
});

var XHRMockObject = function() {
	return {
		readyState: 4,
		status: 200,
		responseText: "",
  	open: jest.genMockFunction(),
  	send: jest.genMockFunction().mockImplementation(function() {
  		this.onload();
		})
	}
};
