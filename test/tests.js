// mock dependencies
GLOBAL.Pebble = {
  addEventListener:function(){}
};
GLOBAL.navigator = {};

var expect = require('chai').expect;
var Slebble = require('../src/js/pebble-js-app');

var mkt = function (list) {
  var ret = [];
  for(var i = 0; i<list.length; i++){
    ret.push({time:list[i]})
  }
  return ret;
};

describe("Slebble", function () {
  describe("._slTimeSort", function () {
    var config = {
      provider: 'sl',
      maxDepatures: 15
    };

    //Slebble.loadConfig(config);
    var ctx = Slebble._test;

    it("no sort needed 1 min", function () {
      var list = [{time:"1 min"},{time:"2 min"}];
      var exp = list.sort(ctx.slTimeSort);

      expect(exp).eql(list);
    });

    it("no sort needed Nu, 1 min", function () {
      var list = mkt(['Nu', '1 min']);
      var exp = list.sort(ctx.slTimeSort);

      expect(exp).eql(list);
    });

    it("no sort needed 20:00", function () {
      var list = mkt(['20:00', '20:20']);
      var exp = list.sort(ctx.slTimeSort);

      expect(exp).eql(list);
    });

    it("sort 2 min,1 min", function () {
      var list = mkt(['2 min','1 min']);
      var exp = list.sort(ctx.slTimeSort);

      expect(exp).eql(mkt(['1 min','2 min']));
    });

    it("sort 2 min, Nu", function () {
      var list = mkt(['2 min','Nu']);
      var exp = list.sort(ctx.slTimeSort);

      expect(exp).eql(mkt(['Nu','2 min']));
    });

    it("sort 2 min, 3 min, 1 min", function () {
      var list = mkt(["2 min","3 min","1 min"]);
      var exp = list.sort(ctx.slTimeSort);

      expect(exp).eql(mkt(["1 min","2 min","3 min"]));
    });

    it("sort 3 min, 2 min, 1 min", function () {
      var list = mkt(["3 min","2 min","1 min"]);
      var exp = list.sort(ctx.slTimeSort);

      expect(exp).eql(mkt(["1 min","2 min","3 min"]));
    });

    it("sort 20:40, 3 min, 1 min", function () {
      var list = mkt(["20:40","3 min","1 min"]);
      var exp = list.sort(ctx.slTimeSort);

      expect(exp).eql(mkt(["1 min","3 min","20:40"]));
    });

    it("sort 20:40, Nu, 1 min", function () {
      var list = mkt(["20:40","Nu","1 min"]);
      var exp = list.sort(ctx.slTimeSort);

      expect(exp).eql(mkt(["Nu","1 min","20:40"]));
    });

    it("sort 20:40, 22:00, 21:40", function () {
      var list = mkt(["20:40","22:00","21:40"]);
      var exp = list.sort(ctx.slTimeSort);

      expect(exp).eql(mkt(['20:40', '21:40', '22:00']));
    });

    it("case 1", function () {
      var list = mkt(['Nu','4 min','8 min','9 min','16 min','20 min','22 min','27 min','27 min','22:49','22:51','22:58','23:03','23:09','23:09','7 min','20 min','22:47','3 min','18 min','22:45']);
      list.sort(ctx.slTimeSort);

      expect(list).eql(mkt(['Nu','3 min','4 min','7 min','8 min','9 min','16 min','18 min','20 min','20 min','22 min','27 min','27 min','22:45','22:47','22:49','22:51','22:58','23:03','23:09','23:09']));
    });

    it("case 2", function () {
      var list = mkt(["4 min","6 min","7 min","8 min","18 min","19 min","28 min","28 min","22:58","23:00","23:00","23:01","23:10","23:11","23:21","23:21","4 min","5 min","7 min","8 min","13 min","17 min","25 min","22:55","22:57","22:59","23:01","23:01","23:10","23:15","23:18","7 min","20 min","26 min","27 min","23:09","23:12","23:19","Nu","11 min","23 min","22:53","23:04","23:16","5 min","16 min","23 min","22:58","23:09","23:16","7 min","22 min","23:00","23:15","Nu","10 min","16 min","Nu","8 min","12 min","1 min","6 min","10 min","1 min","Nu","2 min","10 min","17 min"]);
      var exp = list.sort(ctx.slTimeSort);

      expect(exp).eql(mkt(['Nu','Nu','Nu','Nu','1 min','1 min','2 min','4 min','4 min','5 min','5 min','6 min','6 min','7 min','7 min','7 min','7 min','8 min','8 min','8 min','10 min','10 min','10 min','11 min','12 min','13 min','16 min','16 min','17 min','17 min','18 min','19 min','20 min','22 min','23 min','23 min','25 min','26 min','27 min','28 min','28 min','22:53','22:55','22:57','22:58','22:58','22:59','23:00','23:00','23:00','23:01','23:01','23:01','23:04','23:09','23:09','23:10','23:10','23:11','23:12','23:15','23:15','23:16','23:16','23:18','23:19','23:21','23:21']));
    });

    it("case 3", function () {
      var list = mkt(["2 min","22:38","2 min","11 min","6 min","17 min","11 min","23:11","19 min","23:17","26 min","23:19","22:57","13 min","22:59","23:13","23:01","16 min","23:01","23:16","23:10","22:38","23:15","11 min","23:18","17 min","23:26","23:11","3 min","23:17","15 min","23:19","20 min","13 min","21 min","23:13","23:09","16 min","23:12","23:16","23:19","22:38","Nu","11 min","10 min","17 min","17 min","23:11","29 min","23:17","23:09","23:19","23:16","13 min","23:28","23:13","5 min","16 min","17 min","23:16","24 min","22:38","23:04","11 min","23:16","17 min","23:23","23:11","4 min","23:17","10 min","23:19","18 min","13 min","2 min","23:13","6 min","16 min","9 min","23:16","2 min","22:38","4 min","11 min","9 min","17 min","1 min","23:11","5 min","23:17","11 min","23:19","19 min","13 min","1 min","23:13","8 min","16 min","16 min","23:16"]);
      var exp = list.sort(ctx.slTimeSort);

      expect(exp).eql(mkt(['Nu','1 min','1 min','2 min','2 min','2 min','2 min','3 min','4 min','4 min','5 min','5 min','6 min','6 min','8 min','9 min','9 min','10 min','10 min','11 min','11 min','11 min','11 min','11 min','11 min','11 min','13 min','13 min','13 min','13 min','13 min','15 min','16 min','16 min','16 min','16 min','16 min','16 min','17 min','17 min','17 min','17 min','17 min','17 min','17 min','18 min','19 min','19 min','20 min','21 min','24 min','26 min','29 min','22:38','22:38','22:38','22:38','22:38','22:57','22:59','23:01','23:01','23:04','23:09','23:09','23:10','23:11','23:11','23:11','23:11','23:11','23:12','23:13','23:13','23:13','23:13','23:13','23:15','23:16','23:16','23:16','23:16','23:16','23:16','23:16','23:17','23:17','23:17','23:17','23:17','23:18','23:19','23:19','23:19','23:19','23:19','23:19','23:23','23:26','23:28']));
    });

    it("case 4", function () {
      var list = mkt(["1 min","2 min","2 min","3 min","4 min","5 min","6 min","9 min","22:40","9 min","12 min","12 min","14 min","14 min","14 min","15 min","16 min","17 min","17 min","18 min","18 min","18 min","21 min","23 min","24 min","22:55","22:57","27 min","29 min","29 min","23:03","23:03","23:05","23:03","23:09","23:10","23:10","23:11","23:09","23:13","23:14","23:15","23:15","23:17","23:18","23:18","23:20","23:23","23:23","23:24","23:25","23:25","23:28","23:30","23:33","22:30","23:00","23:30","4 min","8 min","10 min","4 min","12 min","18 min","1 min","4 min"]);
      var exp = list.sort(ctx.slTimeSort);

      expect(exp).eql(mkt(['1 min','1 min','2 min','2 min','3 min','4 min','4 min','4 min','4 min','5 min','6 min','8 min','9 min','9 min','10 min','12 min','12 min','12 min','14 min','14 min','14 min','15 min','16 min','17 min','17 min','18 min','18 min','18 min','18 min','21 min','23 min','24 min','27 min','29 min','29 min','22:30','22:40','22:55','22:57','23:00','23:03','23:03','23:03','23:05','23:09','23:09','23:10','23:10','23:11','23:13','23:14','23:15','23:15','23:17','23:18','23:18','23:20','23:23','23:23','23:24','23:25','23:25','23:28','23:30','23:30','23:33']));
    });
  });
});
