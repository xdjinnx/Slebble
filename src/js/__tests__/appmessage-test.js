jest.dontMock('../appmessage.js');
var appmessage;
var nack;


beforeEach(function() {
  appmessage = require('../appmessage.js');
  nack = 0;
});

xdescribe('addStation', function() {
  it('checks if entire stations set is sent to watch', function() {
    Pebble = new PebbleMock();
    nack = 4;

    appmessage.addStation([{from: 'place'}, {from: 'sec place', last: true}], 12345);

    expect(Pebble.sendAppMessage.mock.calls.length).toBe(6);
  });
});

xdescribe('addRide', function() {
  it('checks if entire ride set is sent to watch', function() {
    Pebble = new PebbleMock();
    nack = 4;

    appmessage.addRide([{number: 1, destination: 'somewhere', time: '22:22', displayTime: 2},
    {number: 2, destination: 'somewhere', time: '22:24', displayTime: 3, last: true}], 12345);

    expect(Pebble.sendAppMessage.mock.calls.length).toBe(6);
  });
});

xdescribe('addMessageError', function() {
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
