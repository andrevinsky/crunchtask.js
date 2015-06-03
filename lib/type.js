/**
 * Created by ANDREW on 6/2/2015.
 */

'use strict';

var
  /**
   *
   * @type {{isFunction(),isArray(),isBoolean(),isNumber(),isUndefined(),isObject()}}
   */
  result = {},
  __toString = Object.prototype.toString,
  _undef,
  sourceTypes = [true, 1, [], function () {}, _undef, {}],
  classNamePattern = /\s+(\w+)]/,
  fullName,
  originalName; // PhantomJS bug

for (var i = 0, maxI = sourceTypes.length; i < maxI; i++) {
  fullName = (originalName = __toString.call(sourceTypes[i])).replace('DOMWindow', 'Undefined'); // PhantomJS bug
  result['is' + fullName.match(classNamePattern)[1]] = getTestFor(originalName);
}

function getTestFor(fullName) {
  return function (val) {
    return __toString.call(val) === fullName;
  };
}


module.exports = result;