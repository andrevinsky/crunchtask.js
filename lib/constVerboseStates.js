/**
 * Created by ANDREW on 6/4/2015.
 */
'use strict';

var arrayToObject = require('./arrayToObject'),
  STATE_NAMES = require('./constStateNames');

var VERBOSE_STATES = arrayToObject([
  STATE_NAMES.resolved,
  STATE_NAMES.rejected,
  STATE_NAMES.error,
  STATE_NAMES.aborted
], [
  'success',
  'failure',
  'error',
  'aborted'
]);

module.exports = VERBOSE_STATES;
