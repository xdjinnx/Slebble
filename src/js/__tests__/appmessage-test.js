jest.dontMock('../appmessage.js');
var appmessage = require('../appmessage.js');
var nack = 0;

describe('addStation', function() {
  it('checks if entire stations set is sent to watch', function() {
    Pebble = new PebbleMock();
    nack = 4;

    appmessage.addStation([{index: 0, from: 'place', nr: 1}, {index: 1, from: 'sec place', nr: 2}], 12345);

    expect(Pebble.sendAppMessage.mock.calls.length).toBe(6);
  });
});

describe('addRide', function() {
  it('checks if entire ride set is sent to watch', function() {
    Pebble = new PebbleMock();
    nack = 4;

    appmessage.addRide([{index: 0, nr: 1, number: 1, destination: 'somewhere', time: '22:22', displayTime: 2},
    {index: 1, nr: 2, number: 2, destination: 'somewhere', time: '22:24', displayTime: 3}], 12345);

    expect(Pebble.sendAppMessage.mock.calls.length).toBe(6);
  });
});

describe('addMessageError', function() {
  it('checks if error message is sent to watch', function() {
    Pebble = new PebbleMock();
    nack = 4;

    appmessage.appMessageError('title', 'subtitle', 12345);

    expect(Pebble.sendAppMessage.mock.calls.length).toBe(5);
  });
});

var PebbleMock = function (){ return {
  sendAppMessage: jest.genMockFunction().mockImplementation(function(obj, ackCallback, nackCallback) {
    if(nack > 0)
      nackCallback();
    else
      ackCallback();
    nack--;

    jest.runAllTimers();
  })
}};
