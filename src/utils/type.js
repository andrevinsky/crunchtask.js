/**
 * Created by andrew on 4/21/16.
 */

/**
 *
 * @type {{isFunction(),isArray(),isBoolean(),isNumber(),isUndefined(),isObject()}}
 */
let result = {};
let   fullName,
  originalName; // PhantomJS bug

const
  __toString = Object.prototype.toString,
  _undef = undefined,
  sourceTypes = [true, 1, [], function () {}, _undef, {}],
  classNamePattern = /\s+(\w+)]/;

for (let i = 0, maxI = sourceTypes.length; i < maxI; i++) {
  fullName = (originalName = __toString.call(sourceTypes[i])).replace('DOMWindow', 'Undefined'); // PhantomJS bug
  result['is' + fullName.match(classNamePattern)[1]] = getTestFor(originalName);
}

function getTestFor(fullName) {
  return function (val) {
    return __toString.call(val) === fullName;
  };
}

export default result;