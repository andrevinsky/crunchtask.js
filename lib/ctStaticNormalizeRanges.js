/**
 * Created by ANDREW on 6/4/2015.
 */
'use strict';

var __slice = [].slice;

var Range = require('./typeRange');

function normalizeRanges() {
  var args = __slice.call(arguments, 0);
  return new Range(args);
}

module.exports = normalizeRanges;