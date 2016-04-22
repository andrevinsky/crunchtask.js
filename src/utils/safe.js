/**
 * Created by andrew on 4/21/16.
 */
import type from './type';
import globals from './globals';
import { config } from '../essentials/config';

const __slice = [].slice;

/**
 *
 * @param {{}} [ctx]
 * @param {function} fn
 * @returns {function}
 */
export default function safe(ctx, fn) {
  if (type.isFunction(ctx)) {
    //noinspection JSValidateTypes
    fn = ctx;
    //noinspection JSValidateTypes,JSHint
    ctx = this;
  }
  if (!type.isFunction(fn)) {
    fn = function () { };
  }
  return function () {
    var args0 = __slice.call(arguments, 0);
    try {
      fn.apply(ctx, args0);
      return true;
    } catch (e) {
      globals.staticLastSafeError = e;
      if (config.debug) {
        console.log(e + ', stack: ' + e.stack);
      }
      return false;
    }
  };
}