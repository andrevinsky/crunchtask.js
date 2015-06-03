/**
 * Created by ANDREW on 6/4/2015.
 */
'use strict';

var __slice = [].slice;

var config = require('./config').config,
  getExecutableFor = require('./ctFnGetExecutableFor'),

  CrunchTask = require('./typeCrunchtask'),
  Range = require('./typeRange');

function staticForEach(arr, taskBody, taskTail) {

  return new CrunchTask(function (init, body, fin) {
    var ranges,
      ptr,
      arrInternal = arr,
      canRunCycle,
      bodyFn = getExecutableFor(taskBody, this),
      tailFn = getExecutableFor(taskTail, this);

    init(function (_arr) {
      if (_arr) {
        arrInternal = arr;
      }
      ranges = new Range([0, arrInternal.length]);
      canRunCycle = ranges.canAdvance(true);
    });

    body(function (resolve) {
      if (canRunCycle) {
        ptr = ranges.valueOf()[0];
        bodyFn([arrInternal[ptr], ptr]);
      }
      if (!canRunCycle || !ranges.canAdvance()) {
        resolve();
      }
    }, config.timeLimit, config.timeoutAmount);

    fin(function () {
      tailFn(ranges.valueOf());
    });
  });
}


module.exports = staticForEach;