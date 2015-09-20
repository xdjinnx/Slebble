jest.dontMock('../src/js/api.js');

describe('requestSLRealtime', function() {
  it('Check if requestSLRealtime works', function() {

 	  XMLHttpRequest = function() {
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

    var api = require('../src/js/api.js');
    var mockCallback = jest.genMockFunction();
    api.requestSLRealtime(12345, mockCallback);

    expect(mockCallback.mock.calls.length).toBe(1);
  });
});


/*

function(siteid, callback, packageKey)
  return {
  	requestSLRealtime: requestSLRealtime,
  	requestResrobot: requestResrobot,
  	requestNearbyStations: requestNearbyStations
  };
  */