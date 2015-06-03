/**
 * Created by ANDREW on 6/4/2015.
 */
'use strict';

var __slice = [].slice;

var type = require('./type'),
  extend = require('./extend'),
  partial = require('./partial'),
  serveEvents = require('./events'),
  defer = require('./defer'),
  safe = require('./safe'),
  together = require('./together'),
  globals = require('./globals'),
  config = require('./config').config,
  EVENT_NAMES = require('./constEventNames'),
  STATE_NAMES = require('./constStateNames'),
  SETTLED_STATES = require('./constSettledStates'),
  Promise = require('promise-polyfill');

function encapsulateRunInstance(instanceApi, taskEvents, resolveReject, promise) {

  var ctx = this, // jshint ignore:line
    thisTask = ctx.task,
    parentTask = ctx.parentTask,
    resolveSafe = safe(resolveReject.resolve),
    rejectSafe = safe(resolveReject.reject),
    runEvents = serveEvents(promise),
    triggerBoth = together(runEvents.trigger, taskEvents.trigger);

  if (parentTask) {
    parentTask.childTask = thisTask;
  }

  return extend(instanceApi, {

    /**
     *
     * @param _initFn
     * @returns {*}
     */
    setupInit: function (_initFn) {
      if (config.trace) {
        console.log('setupInit', new Date() - 0);
      }

      if (SETTLED_STATES[ctx.state]) {
        return;
      }

      if (!type.isUndefined(_initFn) && !type.isFunction(_initFn)) {
        return signalError('CrunchTask.description.initSetup', 'Init setup expects an optional function.');
      }

      ctx.initFn = safe(thisTask, _initFn);
    },

    /**
     *
     * @param _bodyFn
     * @param _needRepeat
     * @param _timeout
     * @returns {*}
     */
    setupBody: function (_bodyFn, _needRepeat, _timeout) {
      if (config.trace) {
        console.log('setupBody', new Date() - 0);
      }
      if (SETTLED_STATES[ctx.state]) {
        return;
      }

      if (!type.isFunction(_bodyFn)) {
        return signalError('CrunchTask.description.bodySetup', 'Body setup expects a function as a first optional arg.');
      }

      if (!type.isUndefined(_needRepeat) && !type.isBoolean(_needRepeat) && !type.isNumber(_needRepeat)) {
        return signalError('CrunchTask.description.bodySetup', 'Body setup expects a number or false as a 2nd optional arg.');
      }

      if (!type.isUndefined(_timeout) && !type.isNumber(_timeout)) {
        return signalError('CrunchTask.description.bodySetup', 'Body setup expects a number as a 3rd optional arg.');
      }

      ctx.bodyFn = safe(thisTask, _bodyFn);
      ctx.conditionsToMeet--;

      ctx.needRepeat = _needRepeat;
      ctx.timeoutAmount = _timeout;
    },

    /**
     *
     * @param _finallyFn
     * @returns {*}
     */
    setupFin: function (_finallyFn) {
      if (config.trace) {
        console.log('setupFin', new Date() - 0);
      }
      if (SETTLED_STATES[ctx.state]) {
        return;
      }
      if (!type.isUndefined(_finallyFn) && !type.isFunction(_finallyFn)) {
        return signalError('CrunchTask.description.finSetup', 'Fin setup expects a function as a first optional arg.');
      }
      ctx.finallyFn = safe(thisTask, _finallyFn);
    },

    signalError: signalError,

    runEventsOn: runEvents.on,
    //onError: partial(runEvents.on, EVENT_NAMES.error),
    //onDone: partial(runEvents.on, EVENT_NAMES.done),
    //onFail: partial(runEvents.on, EVENT_NAMES.fail),
    //onAlways: partial(runEvents.on, [EVENT_NAMES.done,EVENT_NAMES.fail].join()),

    /**
     *
     */
    goRunning: function () {
      thisTask.runCount++;
      ctx.state = STATE_NAMES.running;
      taskEvents.trigger(EVENT_NAMES.run, ctx.id); // no need to call runInst
    },
    /**
     *
     */
    resolve  : function () {
      if (SETTLED_STATES[ctx.state]) {
        return;
      }
      var args0 = __slice.call(arguments, 0);
      ctx.state = STATE_NAMES.resolved;
      ctx.value = args0;

      decreaseRunning(thisTask);

      signalGeneric(args0, EVENT_NAMES.done, resolveSafe);
    },
    /**
     *
     */
    reject   : function () {

      if (SETTLED_STATES[ctx.state]) {
        return;
      }
      var args0 = __slice.call(arguments, 0);
      ctx.state = STATE_NAMES.rejected;
      ctx.value = args0;

      decreaseRunning(thisTask);

      signalGeneric(args0, EVENT_NAMES.fail, rejectSafe);
    },
    abort    : function () {
      if (SETTLED_STATES[ctx.state]) {
        return;
      }
      ctx.state = STATE_NAMES.aborted;
      return this;
    },

    pause: function () {
      if (SETTLED_STATES[ctx.state]) {
        return;
      }
      ctx.state = STATE_NAMES.paused;
      return this;
    },

    resume: function () {
      if (SETTLED_STATES[ctx.state]) {
        return;
      }
      ctx.state = STATE_NAMES.running;
      return this;
    },

    sendNotify: partial(triggerBoth, EVENT_NAMES.progress)

  });

  function signalError() {
    if (SETTLED_STATES[ctx.state]) {
      return;
    }

    var args0 = __slice.call(arguments, 0);
    ctx.state = STATE_NAMES.error;
    ctx.value = args0;

    signalGeneric(args0, EVENT_NAMES.error, rejectSafe);
  }

  function signalGeneric(args0, eventName, actionFn) {

    triggerBoth.apply(this, [eventName].concat(args0)); // jshint ignore:line

    if (actionFn) {
      defer.call(thisTask, 0, actionFn, [args0]);
    }
  }

  function signalTwoParties(taskC, taskP) {
    defer(1, function () {
      if ((taskC.runCount + taskP.runCount) > 0) {
        return;
      }
      globals.staticSecurityLock = true;
      taskC._signalIdle();
      globals.staticSecurityLock = true;
      taskP._signalIdle();

      delete ctx.parentTask;
      delete taskP.childTask;

    });
  }

  function decreaseRunning(thisTask) {
    thisTask.runCount = Math.max(0, thisTask.runCount - 1);
    if (thisTask.runCount) {
      return;
    }

    delete thisTask.isAborted;
    delete thisTask.isPaused;

    if (thisTask.childTask) {
      signalTwoParties(thisTask.childTask, thisTask);
    } else if (ctx.parentTask) {
      signalTwoParties(thisTask, ctx.parentTask);
    } else {
      defer(1, function() {
        if (thisTask.runCount) {
          return;
        }
        globals.staticSecurityLock = true;
        thisTask._signalIdle();
      });
    }

  }

}
module.exports = encapsulateRunInstance;