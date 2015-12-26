//jest.dontMock('../api.js');
//var appmessage = require('../appmessage.js');
//var api = require('../api.js');

xdescribe('requestSLRealtime', function() {
  it('checks if XHR success route is correct', function() {
 	  XMLHttpRequest = XHRSuccessMockObject;
    var mockCallback = jest.genMockFunction();
    appmessage.appMessageError.mockClear();

    api.requestSLRealtime(12345, mockCallback);
    api.requestSLRealtime(12345, mockCallback, 5);

    expect(mockCallback.mock.calls.length).toBe(2);
    expect(appmessage.appMessageError.mock.calls.length).toBe(0);

  });

  it('checks if XHR fail route is correct', function() {
    XMLHttpRequest = XHRFailMockObject;
    var mockCallback = jest.genMockFunction();
    appmessage.appMessageError.mockClear();

    api.requestSLRealtime(12345, mockCallback);
    api.requestSLRealtime(12345, mockCallback, 5);

    expect(mockCallback.mock.calls.length).toBe(0);
    expect(appmessage.appMessageError.mock.calls.length).toBe(2);
  });
});

xdescribe('requestResrobot', function() {
  it('checks if XHR success route is correct', function() {
 	  XMLHttpRequest = XHRSuccessMockObject;
    var mockCallback = jest.genMockFunction();
    appmessage.appMessageError.mockClear();

    api.requestResrobot(12345, mockCallback);
    api.requestResrobot(12345, mockCallback, 5);

    expect(mockCallback.mock.calls.length).toBe(2);
    expect(appmessage.appMessageError.mock.calls.length).toBe(0);
  });

  it('checks if XHR fail route is correct', function() {
    XMLHttpRequest = XHRFailMockObject;
    var mockCallback = jest.genMockFunction();
    appmessage.appMessageError.mockClear();

    api.requestResrobot(12345, mockCallback);
    api.requestResrobot(12345, mockCallback, 5);

    expect(mockCallback.mock.calls.length).toBe(0);
    expect(appmessage.appMessageError.mock.calls.length).toBe(2);
  });
});

xdescribe('requestNearbyStations', function() {
  it('checks if requestNearbyStations works', function() {
 	  XMLHttpRequest = XHRSuccessMockObject;
    var mockCallback = jest.genMockFunction();
    appmessage.appMessageError.mockClear();

    api.requestNearbyStations(5, 5, mockCallback);

    expect(mockCallback.mock.calls.length).toBe(1);
    expect(appmessage.appMessageError.mock.calls.length).toBe(0);
  });

  it('checks if XHR fail route is correct', function() {
    XMLHttpRequest = XHRFailMockObject;
    var mockCallback = jest.genMockFunction();
    appmessage.appMessageError.mockClear();

    api.requestNearbyStations(5, 5, mockCallback);

    expect(mockCallback.mock.calls.length).toBe(0);
    expect(appmessage.appMessageError.mock.calls.length).toBe(1);
  });
});

var XHRSuccessMockObject = function() {
  return {
		readyState: 4,
		status: 200,
		responseText: "",
  	open: jest.genMockFunction(),
  	send: jest.genMockFunction().mockImplementation(function() {
  		this.onload();
		}),
	};
};

var XHRFailMockObject = function() {
  return {
		readyState: 4,
		status: 404,
		responseText: "",
  	open: jest.genMockFunction(),
  	send: jest.genMockFunction().mockImplementation(function() {
  		this.onload();
		}),
	};
};
