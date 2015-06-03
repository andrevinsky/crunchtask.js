/**
 * Created by ANDREW on 6/3/2015.
 */
'use strict';

var type = require('./type');

/**
 *
 * @throws Error
 * @param errType
 * @param msg
 */
function error(errType, msg) {
  if (type.isUndefined(msg)) {
    msg = errType;
    errType = 'Generic';
  }
  throw new Error(['`CT_', errType, '`. Message: ', msg].join(''));
}

module.exports = error;