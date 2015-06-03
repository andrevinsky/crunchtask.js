/**
 * Created by ANDREW on 6/4/2015.
 */
'use strict';

var type = require('./type'),
  CrunchTask = require('./typeCrunchtask');

/**
 *
 * @param val
 * @returns {boolean}
 */
function isExecutable(val) {
  return type.isFunction(val) || (val instanceof CrunchTask);
}

module.exports  = isExecutable;