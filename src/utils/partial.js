/**
 * Created by andrew on 4/21/16.
 */
import type from './type';

const __slice = [].slice;


/**
 * Returns a partially applied function `fn` for optional `args`, with optional context of `ctx`
 * @param {{}} [ctx]
 * @param {function} fn
 * @params {...*} args
 * @returns {function} partially applied function
 * @private
 */
export default function partial(/*{ctx}, fn, args..*/) {
  let ctx = this, // jshint ignore:line
    fn = arguments[0],
    args0 = __slice.call(arguments, 1);

  if ((!type.isFunction(fn)) && (type.isFunction(args0[0]))) {
    ctx = arguments[0];
    fn = args0.shift();
  }

  return function (...args1) {
    return fn.apply(ctx, [].concat(args0, args1));
  };
}