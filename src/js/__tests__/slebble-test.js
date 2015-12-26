jest.dontMock('../slebble.js');

xdescribe('slebble', function() {
 it('tests a test', function() {
   var slebble = require('../slebble.js');
   var a = {displayTime: 1};
   var b = {displayTime: 2};
   expect(slebble.__testonly__._slTimeSort(a, b)).toBe(-1);
 });
});
