/**
 * Created by ANDREW on 6/4/2015.
 */
'use strict';

var __slice = [].slice;

var globals = require('./globals'),
  defer = require('./defer'),
  partial = require('./partial'),
  isExecutable = require('./ctFnIsExecutable'),

  config = require('./config').config,
  STATE_NAMES = require('./constStateNames'),
  getExecutableFor = require('./ctFnGetExecutableFor'),
  resolvedTask = require('./ctFnResolvedTask'),

  CrunchTask = require('./typeCrunchtask'),
  Range = require('./typeRange');

//noinspection JSCommentMatchesSignature,JSValidateJSDoc
/**
 * @param {number} [start]
 * @param {number} [finish]
 * @param {number} [increment]
 * @param {boolean} [inclusive]
 * @param {function|CrunchTask} fnBody
 * @param {function|CrunchTask} fnTail
 * @returns {CrunchTask}
 */
function staticFor(/*{start, finish, increment, inclusive, } * n, fnBody, {fnTail}*/) {
  var argsCount = arguments.length,
    fnCount = 0;

  while (isExecutable(arguments[argsCount - 1 - fnCount])) {
    fnCount++;
  }

  var args = __slice.call(arguments, 0, argsCount - fnCount),
    fns = __slice.call(arguments, -fnCount),
    ranges = new Range(args),
    taskBody = fns[0],
    taskTail = fns[1] || function () {
      };

  if (!taskBody) {
    return resolvedTask();
  }

  return internalFor(ranges, taskBody, taskTail);
}

function internalFor(_ranges, taskBody, taskTail) {
  return new CrunchTask(function (init, body, fin) {
    var ranges = _ranges, canRunCycle,
      bodyFn = getExecutableFor(taskBody, this),
      tailFn = getExecutableFor(taskTail, this);

    init(function () {
      var args = __slice.call(arguments, 0);
      if (args.length) {
        ranges = new Range(args);
      }
      canRunCycle = ranges.canAdvance(true);
    });

    body(function (resolve) {
      if (canRunCycle) {
        bodyFn(ranges.valueOf());
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


module.exports = staticFor;