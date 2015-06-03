/**
 * Created by ANDREW on 6/3/2015.
 */
'use strict';

var __hasOwnProperty = {}.hasOwnProperty,
  __slice = [].slice;

var type = require('./type'),
  bind = require('./bind');

/**
 * Executes the `fn` function in context of `ctx` and returns if result or `ctx` for chainability
 * @param ctx
 * @param {{}} target
 * @param {{}} source
 * @returns {{}}
 */
function _fnBindAll(ctx, target, source) {
  var method;

  for (var prop in source) {
    //noinspection JSUnfilteredForInLoop
    if (__hasOwnProperty.call(source, prop)) {
      //noinspection JSUnfilteredForInLoop
      method = source[prop];

      if (type.isFunction(method)) {
        //noinspection JSUnfilteredForInLoop
        target[prop] = bind(ctx, method);
      }
    }
  }

  return target;
}

module.exports = _fnBindAll;