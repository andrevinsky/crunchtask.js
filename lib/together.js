/**
 * Created by ANDREW on 6/3/2015.
 */
'use strict';

var __slice = [].slice;

var type = require('./type');

/**
 *
 * @params {...function} fns
 * @returns {Function}
 */
function _fnTogether(/* fns */) {
  var auxFns = __slice.call(arguments, 0);
  return function () {
    var args = __slice.call(arguments, 0),
      auxFn, fnsCopy = [].concat(auxFns);
    while ((auxFn = fnsCopy.shift()) && type.isFunction(auxFn)) {
      auxFn.apply(this, args);
    }
  };
}

module.exports = _fnTogether;