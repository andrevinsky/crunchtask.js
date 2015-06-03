/**
 * Created by ANDREW on 1/31/2015.
 * Playground
 */
//var Promise = require('../bower_components/promise-polyfill/Promise.min');
//var CrunchTask = require('../lib/crunchtask');

//var undef;
//console.info(CrunchTask.rangeCheck());
//console.info(CrunchTask.rangeCheck('123', undef, /123/));
//console.info(CrunchTask.rangeCheck(0, 9, .5, true));
//var step = 5;
//console.info(CrunchTask.rangeCheck(0, 9, step, true));
//console.info(CrunchTask.rangeCheck(0, 9, 1, true, 9, 0, -1, true));
//console.info(CrunchTask.rangeCheck(0, 9, 1, true, 9, 0, -1, true, 5, 1, false));
//console.info(CrunchTask.rangeCheck([0, 9, [1, 9]]));
//console.info(CrunchTask.rangeCheck([1, 9, true], 9, 0, -.5, false,[0,5]));
//console.info(CrunchTask.rangeCheck([0, 9], 9, 0, -.5, false, 9, 0, -.5, [1, 9, true], 9, 0, -.5, false,[0,5]));
//console.info(CrunchTask.rangeCheck(0, 1, true, 0, 1, true, 0, 1, true));
//console.info(CrunchTask.rangeCheck(1,2,false,3,4));
//console.info(CrunchTask.rangeCheck(1,2,true,3,4));
//console.info(CrunchTask.rangeCheck(1,2,3,4));
//console.info(CrunchTask.rangeCheck(1,2,3,4,5));
//console.info(CrunchTask.rangeCheck(1,2,3,4,5,[1,2,3]));
//console.info(CrunchTask.rangeCheck(1,2,3,4,5,[1,2,3],[1,2]));
//console.info(CrunchTask.rangeCheck(1,2,3,4,5,[1,2,3],2,3,[1,2]));
//console.info(CrunchTask.rangeCheck([ 1, 2 ], [ 3, 4, 5 ], [ 1, 2, 3 ], [ 2, 3 ], [ 1, 2 ]));
////
//var range = CrunchTask.rangeCheck(0, 1, true);
//
//console.info(CrunchTask.rangeNextAndCheck(range));
//console.info(CrunchTask.rangeNextAndCheck(range));

//
//CrunchTask['for'](1,2,3,4,5,6, function ab(){});
//CrunchTask['for'](1,2,3,4,5,6, function ab(){}, function de(){});

//console.log('STARTING..');
//var x = CrunchTask.rangeCheck(0,3,1,2,0);
//
//do {
//  console.info(x);
//} while (CrunchTask.next(x));
//
//console.info(x);
//
//var count = 0, time = new Date();
//
//var f = CrunchTask.for([-1,1.00,.001], [-1,1.00,.001], function(i, j) {
//  //console.log('i=', i, ' j=', j);
//  count++;
//}, function(){
//  console.info(arguments);
//  console.log(count, new Date() - time);
//});
//
//f.run();