/**
 * Created by ANDREW on 6/3/2015.
 */

'use strict';

var type = require('./type');
/**
 * Returns an object based on an array, where array's items from the property names, and the value is specified either directly, or corresponds to another array's item
 * @param {[]} arr
 * @param {[]|string|boolean} value
 * @returns {{}}
 * @private
 */
function _arrayToObject(arr, value) {
  var result = {},
    isArray = type.isArray(value);

  for (var i = 0, iMax = arr.length; i < iMax; i++) {
    result[arr[i]] = isArray ? value[i] : value;
  }

  return result;
}

module.exports = _arrayToObject;