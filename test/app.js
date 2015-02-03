/**
 * Created by ANDREW on 1/31/2015.
 */
var Promise = require('../bower_components/promise-polyfill/Promise.min');
var CrunchTask = require('../lib/crunchtask');

//console.info(CrunchTask.normalizeRanges());
//console.info(CrunchTask.normalizeRanges(1));
//console.info(CrunchTask.normalizeRanges(1,2));
//console.info(CrunchTask.normalizeRanges(1,2,3));
//console.info(CrunchTask.normalizeRanges(1,2,3,4));
//console.info(CrunchTask.normalizeRanges(1,2,3,4,5));
//console.info(CrunchTask.normalizeRanges(1,2,3,4,5,[1,2,3]));
//console.info(CrunchTask.normalizeRanges(1,2,3,4,5,[1,2,3],[1,2]));
//console.info(CrunchTask.normalizeRanges(1,2,3,4,5,[1,2,3],2,3,[1,2]));
//console.info(CrunchTask.normalizeRanges([ 1, 2 ], [ 3, 4, 5 ], [ 1, 2, 3 ], [ 2, 3 ], [ 1, 2 ]));
//
//
//CrunchTask['for'](1,2,3,4,5,6, function ab(){});
//CrunchTask['for'](1,2,3,4,5,6, function ab(){}, function de(){});

//console.log('STARTING..');
//var x = CrunchTask.normalizeRanges(0,3,1,2,0);
//
//do {
//  console.info(x);
//} while (CrunchTask.next(x));
//
//console.info(x);
//
var count = 0;

var f = CrunchTask.for([-1,1.00,.01], [-1,1.00,.01], function(i, j) {
  //console.log('i=', i, ' j=', j);
  count++;
}, function(){
  console.info(arguments);
  console.log(count);
});

f.run();