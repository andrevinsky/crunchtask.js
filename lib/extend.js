/**
 * Created by ANDREW on 6/3/2015.
 */
'use strict';

var __hasOwnProperty = {}.hasOwnProperty,
  __slice = [].slice;

/**
 *
 * @param target
 * @param source
 * @returns {*}
 * @private
 */
function _objExtend(target, source) {
  if (arguments.length > 2) {
    return _objExtendMult.apply(null, arguments);
  }

  for (var prop in source) {
    //noinspection JSUnfilteredForInLoop
    if (__hasOwnProperty.call(source, prop)) {
      //noinspection JSUnfilteredForInLoop
      target[prop] = source[prop];
    }
  }
  return target;
}

function _objExtendMult(target/*, sources*/) {
  var sources = __slice.call(arguments, 1), source;
  while (source = sources.shift()) { // jshint ignore:line
    _objExtend(target, source);
  }
  return target;
}

module.exports = _objExtend;
