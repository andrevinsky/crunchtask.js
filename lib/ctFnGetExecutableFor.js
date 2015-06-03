/**
 * Created by ANDREW on 6/4/2015.
 */
'use strict';

var type = require('./type'),
  globals = require('./globals'),
  CrunchTask = require('./typeCrunchtask');

function getExecutableFor(task, ctx) {
  if (type.isFunction(task)) {
    return function (args) {
      return task.apply(ctx || this, args);
    };
  } else if (task instanceof CrunchTask) {
    return function (args) {
      globals.staticParentTask = ctx;
      return task.run.apply(task, args);
    };
  } else {
    return function (k) {
      return k;
    };
  }
}

module.exports  = getExecutableFor;