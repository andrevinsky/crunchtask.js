/**
 * Created by ANDREW on 6/4/2015.
 */
'use strict';

var globals = require('./globals');

/**
 *
 * @callback descriptionFunc
 * @param {function} initSetup
 * @param {function} bodySetup
 * @param {function} finSetup
 */
/**
 *
 * @param {descriptionFunc} descriptionFn
 * @returns {CrunchTask}
 * @constructor
 */
function CrunchTask(descriptionFn) {
  // always dealing with the `new` keyword instantiation
  if (!(this instanceof CrunchTask)) {
    return new CrunchTask(descriptionFn);
  }
  return globals.staticCTImpl(this, descriptionFn);
}


module.exports = CrunchTask;