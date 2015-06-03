/**
 * Created by ANDREW on 6/4/2015.
 */
'use strict';

var arrayToObject = require('./arrayToObject'),
  STATE_NAMES = require('./constStateNames');

var NEED_REPEAT_STATES = arrayToObject([
  STATE_NAMES.running,
  STATE_NAMES.paused
], true);

module.exports = NEED_REPEAT_STATES;