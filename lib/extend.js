/**
 * Created by ANDREW on 6/3/2015.
 */
'use strict';

var __hasOwnProperty = {}.hasOwnProperty;

/**
 *
 * @param target
 * @param source
 * @returns {*}
 * @private
 */
function _objExtend(target, source) {
  for (var prop in source) {
    //noinspection JSUnfilteredForInLoop
    if (__hasOwnProperty.call(source, prop)) {
      //noinspection JSUnfilteredForInLoop
      target[prop] = source[prop];
    }
  }
  return target;
}

module.exports = _objExtend;
