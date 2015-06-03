/**
 * Created by ANDREW on 6/3/2015.
 */
'use strict';

var __slice = [].slice;

/**
 * Executes the `fn` function in context of `ctx` and returns if result or `ctx` for chainability
 * @param ctx
 * @param fn
 * @params {...*} args
 * @returns {Function}|ctx
 * @private
 */
function _fnBind(ctx, fn) {
  var args0 = __slice.call(arguments, 2);
  return function () {
    var args1 = __slice.call(arguments, 0);
    return fn.apply(ctx, [].concat(args0, args1)) || ctx;
  };
}

module.exports = _fnBind;