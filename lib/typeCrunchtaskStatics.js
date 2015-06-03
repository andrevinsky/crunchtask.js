/**
 * Created by ANDREW on 6/4/2015.
 */
'use strict';

var __hasOwnProperty = {}.hasOwnProperty;

var type = require('./type'),
  extend = require('./extend'),
  configs = require('./config'),
  staticFor = require('./ctStaticFor'),
  staticForEach = require('./ctStaticForEach'),
  staticReduce = require('./ctStaticReduce'),
  normalizeRanges = require('./ctStaticNormalizeRanges'),

  CrunchTask = require('./typeCrunchtask');

var config = configs.config,
  defaultConfig = configs.defaultConfig;

extend(CrunchTask, {
  /**
   * @deprecated use range
   * @type {staticFor}
   */
  'for': staticFor,
  range: staticFor,
  rangeCheck: normalizeRanges,

  /**
   * @deprecated use range
   * @type {Range}
   */
  rangeNextAndCheck: function(range, checkOnly) {
    return range.canAdvance(checkOnly);
  },

  forEach: staticForEach,
  reduce: staticReduce,

  /**
   *
   * @param {{boolean}|{ timeLimit:Number, timeoutAmount:Number, debug:boolean }} obj
   */
  config: function _config(obj) {
    if (!type.isObject(obj)) {
      return _config(defaultConfig);
    }
    var result = {};
    for (var prop in obj) {
      //noinspection JSUnfilteredForInLoop
      if (__hasOwnProperty.call(obj, prop) && __hasOwnProperty.call(config, prop)) {
        //noinspection JSUnfilteredForInLoop
        config[prop] = obj[prop];
        //noinspection JSUnfilteredForInLoop
        result[prop] = obj[prop];
      }
    }
    return result;
  }
});

module.exports  = CrunchTask;