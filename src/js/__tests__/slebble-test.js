jest.dontMock('../slebble.js');
var slebble = require('../slebble.js');

describe('slebble', function() {
 it('tests a test', function() {
   var a = {displayTime: 1};
   var b = {displayTime: 2};
   expect(slebble.__testonly__._slTimeSort(a, b)).toBe(-1);
 });
});
