/**
 * Created by ANDREW on 6/4/2015.
 */
'use strict';

var mirror = require('./mirror');

var STATE_NAMES = mirror({
  init    : null,
  error   : null,
  running : null,
  paused  : null,
  resolved: null,
  rejected: null,
  aborted : null
}, 'state.');

module.exports = STATE_NAMES;