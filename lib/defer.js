/**
 * Created by ANDREW on 6/3/2015.
 */
'use strict';

/**
 * Queues execution of this function asynchronously
 * @param {number} timeoutAmount
 * @param {function} fn
 * @param {[]} [args0]
 */
function defer(timeoutAmount, fn, args0) {
  var ctx = this; // jshint ignore:line

  return setTimeout(function () {
    fn.apply(ctx, args0 || []);
  }, timeoutAmount || 0);
}

module.exports = defer;