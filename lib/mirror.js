/**
 * Created by ANDREW on 6/3/2015.
 */

'use strict';

var __hasOwnProperty = {}.hasOwnProperty;

/**
 * For each property assigns a value based on a prefix and the property name
 * @param {object} obj
 * @param {string} prefix
 * @returns {object}
 * @private
 */
function _initObjectProps(obj, prefix) {
  for (var prop in obj) {
    //noinspection JSUnfilteredForInLoop
    if (__hasOwnProperty.call(obj, prop)) {
      //noinspection JSUnfilteredForInLoop
      obj[prop] = prefix + prop;
    }
  }
  return obj;
}

module.exports = _initObjectProps;