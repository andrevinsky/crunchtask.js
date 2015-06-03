/**
 * Created by ANDREW on 6/4/2015.
 */
'use strict';

var type = require('./type'),
  config = require('./config').config,
  getExecutableFor = require('./ctFnGetExecutableFor'),

  CrunchTask = require('./typeCrunchtask'),
  Range = require('./typeRange');


function staticReduce(arr, memo, taskBody, taskTail) {

  return new CrunchTask(function (init, body, fin) {

    var ranges,
      ptr,
      arrInternal = arr,
      memoInternal = memo,
      canRunCycle,
      bodyFn = getExecutableFor(taskBody, this),
      tailFn = getExecutableFor(taskTail, this);

    init(function (_arr, _memo) {
      if (_arr) {
        arrInternal = arr;
      }
      ranges = new Range([0, arrInternal.length]);
      canRunCycle = ranges.canAdvance(true);
      if (!type.isUndefined(_memo)) {
        memoInternal = _memo;
      }
    });

    body(function (resolve) {
      if (canRunCycle) {
        ptr = ranges.valueOf()[0];
        memoInternal = bodyFn([memoInternal, arrInternal[ptr], ptr]);
      }
      if (!canRunCycle || !ranges.canAdvance()) {
        resolve(memoInternal);
      }
    }, config.timeLimit, config.timeoutAmount);

    fin(function () {
      tailFn(memoInternal, ranges.valueOf());
    });
  });
}


module.exports = staticReduce;