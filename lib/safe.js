/**
 * Created by ANDREW on 6/3/2015.
 */
'use strict';

var __slice = [].slice;

var type = require('./type'),
  configs = require('./config'),
  globals = require('./globals');

var config = configs.config;

/**
 *
 * @param {{}} [ctx]
 * @param {function} fn
 * @returns {function}
 */
function safe(ctx, fn) {
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

module.exports = safe;