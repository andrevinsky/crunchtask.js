/**
 * Created by andrew on 4/21/16.
 */
import type from './type';
import __slice from './slice';

/**
 *
 * @params {...function} fns
 * @returns {Function}
 */
export default function together(/* fns */) {
  var auxFns = __slice.call(arguments, 0);

  return function () {
    var args = __slice.call(arguments, 0),
      auxFn,
      fnsCopy = [].concat(auxFns);
    
    while ((auxFn = fnsCopy.shift()) && type.isFunction(auxFn)) {
      auxFn.apply(this, args);
    }
  };
}