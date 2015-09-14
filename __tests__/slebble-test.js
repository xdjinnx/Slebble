jest.dontMock('../src/js/slebble.js');

describe('slebble', function() {
 it('check if 1 is less then 2', function() {
   var slebble = require('../src/js/slebble.js');
   var a = {displayTime: 1};
   var b = {displayTime: 2};
   expect(slebble.__testonly__._slTimeSort(a, b)).toBe(-1);
 });
});