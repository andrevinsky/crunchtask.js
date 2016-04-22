/**
 * Created by andrew on 4/23/16.
 */

import { getExecutableFor } from '../essentials/executables';
import { config } from '../essentials/config';

import Range from '../essentials/range';
import type from '../utils/type';

export function staticReduce(arr, memo, taskBody, taskTail) {

  const TaskType = type.getTaskType();

  return new TaskType(function (init, body, fin) {

    const bodyFn = getExecutableFor(taskBody, this),
      tailFn = getExecutableFor(taskTail, this);

    let ranges,
      ptr,
      arrInternal = arr,
      memoInternal = memo,
      canRunCycle;

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