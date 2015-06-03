/**
 * Created by ANDREW on 6/4/2015.
 */
'use strict';

var __slice = [].slice;

var getExecutableFor = require('./ctFnGetExecutableFor'),
  CrunchTask = require('./typeCrunchtask');

var protoMethods = {
  isIdle   : function isIdle() {
    return this.runCount === 0;
  },
  pause: function protoPause() {
    this.isPaused = true; // jshint ignore:line
    return this;
  },
  resume: function protoResume() {
    delete this.isPaused; // jshint ignore:line
    return this;
  },
  abort: function protoAbort() {
    this.isAborted = true; // jshint ignore:line
    return this;
  },
  then: function protoThen(descriptionFn /*, tasks..*/){
    var args0 = __slice.call(arguments, 1), _newTask;
    try {
      return (_newTask = new CrunchTask(descriptionFn));
    } finally {
      _newTask.done(doneHandler);
      this.done(doneHandler);
    }

    function doneHandler() {
      var args1 = __slice.call(arguments, 0), task;
      while ((task = args0.shift())) {
        getExecutableFor(task)(args1);
      }
    }
  }
};

module.exports = protoMethods;