/**
 * Created by andrew on 4/21/16.
 */
import type from '../utils/type';
import globals from '../utils/globals';

export function getExecutableFor(task, ctx) {
  if (type.isFunction(task)) {
    return function (args) {
      return task.apply(ctx || this, args);
    };
  } else if (dynamic.isBuddy(task)) {
    return function (args) {
      globals.staticParentTask = ctx;
      return task.run.apply(task, args);
    };
  } else {
    return function (k) {
      return k;
    };
  }
}

/**
 *
 * @param val
 * @returns {boolean}
 */
export function isExecutable(val) {
  return type.isFunction(val) || type.isBuddy(val);
}

export default getExecutableFor;