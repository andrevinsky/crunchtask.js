/**
 * Created by ANDREW on 6/4/2015.
 */
'use strict';

var mirror = require('./mirror');

var EVENT_NAMES = mirror({
  run     : null,
  done    : null,
  fail    : null,
  abort   : null,
  error   : null,
  progress: null,
  idle    : null
}, 'event.');

module.exports = EVENT_NAMES;