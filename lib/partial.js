/**
 * Created by ANDREW on 6/3/2015.
 */
'use strict';

var __slice = [].slice;

var type = require('./type');

//noinspection JSCommentMatchesSignature,JSValidateJSDoc
/**
 * Returns a partially applied function `fn` for optional `args`, with optional context of `ctx`
 * @param {{}} [ctx]
 * @param {function} fn
 * @params {...*} args
 * @returns {function} partially applied function
 * @private
 */
function _fnPartial(/*{ctx}, fn, args..*/) {
  var ctx = this, // jshint ignore:line
    fn = arguments[0],
    args0 = __slice.call(arguments, 1);

  if ((!type.isFunction(fn)) && (type.isFunction(args0[0]))) {
    ctx = arguments[0];
    fn = args0.shift();
  }

  return function () {
    var args1 = __slice.call(arguments, 0);
    return fn.apply(ctx, [].concat(args0, args1));
  };
}

module.exports = _fnPartial;