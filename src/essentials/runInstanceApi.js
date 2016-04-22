/**
 * Created by andrew on 4/22/16.
 */
import type from '../utils/type';
import safe from '../utils/safe';
import together from '../utils/together';
import partial from '../utils/partial';
import defer from '../utils/defer';

import globals from '../utils/globals';  // TODO: move into essentials

import { serveEvents } from './events';
import { config } from './config';

import * as C from '../constants/index';

export const makeRunInstanceApi = (ctx, taskEvents, promise, promiseControl) => {
  
  const thisTask = ctx.task,
    { parentTask } = ctx,
    resolveSafe = safe(promiseControl.resolve),
    rejectSafe = safe(promiseControl.reject),
    runEvents = serveEvents(promise),
    triggerBoth = together(runEvents.trigger, taskEvents.trigger);
  
  if (parentTask) {
    parentTask.childTask = thisTask;
  }
  
  return {
    setupInit(_initFn) {
      if (config.trace) {
        console.log('setupInit', new Date() - 0);
      }
      if (C.SETTLED_STATES[ctx.state]) {
        return;
      }
      if (!type.isUndefined(_initFn) && !type.isFunction(_initFn)) {
        return signalError('Crunchtask.description.initSetup', 'Init setup expects an optional parameter of type function only.');
      }
      ctx.initFn = safe(thisTask, _initFn);
    },
    setupBody(_bodyFn, _needRepeat, _timeout) {
      if (config.trace) {
        console.log('setupBody', new Date() - 0);
      }
      if (C.SETTLED_STATES[ctx.state]) {
        return;
      }

      if (!type.isFunction(_bodyFn)) {
        return signalError('CrunchTask.description.bodySetup', 'Body setup expects a function as the first optional arg.');
      }

      if (!type.isUndefined(_needRepeat) && !type.isBoolean(_needRepeat) && !type.isNumber(_needRepeat)) {
        return signalError('CrunchTask.description.bodySetup', 'Body setup expects a number or false as the second optional arg.');
      }

      if (!type.isUndefined(_timeout) && !type.isNumber(_timeout)) {
        return signalError('CrunchTask.description.bodySetup', 'Body setup expects a number as the 3rd optional arg.');
      }

      ctx.bodyFn = safe(thisTask, _bodyFn);
      ctx.conditionsToMeet--;

      ctx.needRepeat = _needRepeat;
      ctx.timeoutAmount = _timeout;

    },
    setupFin(_finallyFn) {
      if (config.trace) {
        console.log('setupFin', new Date() - 0);
      }
      if (C.SETTLED_STATES[ctx.state]) {
        return;
      }
      if (!type.isUndefined(_finallyFn) && !type.isFunction(_finallyFn)) {
        return signalError('CrunchTask.description.finSetup', 'Fin setup expects a function as a first optional arg.');
      }
      ctx.finallyFn = safe(thisTask, _finallyFn);
    },
    runEventsOn: runEvents.on,
    signalError,
    goRunning() {
      thisTask.runCount++;
      ctx.state = C.STATE_NAMES.running;
      taskEvents.trigger(C.EVENT_NAMES.run, ctx.id); // no need to call runInst
    },
    resolve(...args) {
      if (C.SETTLED_STATES[ctx.state]) {
        return;
      }
      ctx.state = C.STATE_NAMES.resolved;
      ctx.value = args;

      decreaseRunning(thisTask);

      signalGeneric(args, C.EVENT_NAMES.done, resolveSafe);
    },
    reject(...args) {
      if (C.SETTLED_STATES[ctx.state]) {
        return;
      }
      ctx.state = C.STATE_NAMES.rejected;
      ctx.value = args;

      decreaseRunning(thisTask);

      signalGeneric(args, C.EVENT_NAMES.fail, rejectSafe);
    },
    abort() {
      if (C.SETTLED_STATES[ctx.state]) {
        return;
      }
      ctx.state = C.STATE_NAMES.aborted;
      return this;
    },
    pause() {
      if (C.SETTLED_STATES[ctx.state]) {
        return;
      }
      ctx.state = C.STATE_NAMES.paused;
      return this;
    },
    resume() {
      if (C.SETTLED_STATES[ctx.state]) {
        return;
      }
      ctx.state = C.STATE_NAMES.running;
      return this;
    },
    sendNotify: partial(triggerBoth, C.EVENT_NAMES.progress)
  };
  
  
  function signalError(...args) {
    if (C.SETTLED_STATES[ctx.state]) {
      return;
    }

    ctx.state = STATE_NAMES.error;
    ctx.value = args;

    signalGeneric(args, C.EVENT_NAMES.error, rejectSafe);
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
};