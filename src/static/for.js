/**
 * Created by andrew on 4/23/16.
 */

import { isExecutable, getExecutableFor } from '../essentials/executables';
import { config } from '../essentials/config';

import Range from '../essentials/range';

import { resolvedTask } from './resolvedTask';
import type from '../utils/type';

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
export function staticFor (...n_args /*{start, finish, increment, inclusive, } * n, fnBody, {fnTail}*/)  {
  const argsCount = n_args.length;
  let fnCount = 0;

  while (isExecutable(n_args[argsCount - 1 - fnCount])) {
    fnCount++;
  }
  
  const args = n_args.slice(0, argsCount - fnCount),
    ranges = new Range(args),

    fns = n_args.slice(-fnCount),
    [ taskBody, taskTail = () => {} ] = fns;
  
  if (!taskBody) {
    return resolvedTask();
  }

  return internalFor(ranges, taskBody, taskTail);
}


function internalFor(_ranges, taskBody, taskTail) {

  const TaskType = type.getTaskType();

  return new TaskType(function (init, body, fin) {

    const bodyFn = getExecutableFor(taskBody, this),
      tailFn = getExecutableFor(taskTail, this);

    let ranges = _ranges;
    let canRunCycle;

    init(function (...args) {
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
