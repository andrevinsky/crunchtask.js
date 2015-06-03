/**
 * Created by ANDREW on 6/4/2015.
 */
'use strict';

var arrayToObject = require('./arrayToObject'),
  STATE_NAMES = require('./constStateNames');

var SETTLED_STATES = arrayToObject([
  STATE_NAMES.error,
  STATE_NAMES.resolved,
  STATE_NAMES.rejected,
  STATE_NAMES.aborted
], true);

module.exports = SETTLED_STATES;