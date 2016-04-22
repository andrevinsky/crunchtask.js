/**
 * Created by andrew on 4/22/16.
 */
/**
 * Queues execution of this function asynchronously
 * @param {number} timeoutAmount
 * @param {function} fn
 * @param {[]} [args0]
 */
export default function defer(timeoutAmount, fn, args0) {
  var ctx = this; // jshint ignore:line

  return setTimeout(function () {
    fn.apply(ctx, args0 || []);
  }, timeoutAmount || 0);
}