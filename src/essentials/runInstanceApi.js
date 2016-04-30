/**
 * Created by andrew on 4/22/16.
 */
import type from '../utils/type';
import safe from '../utils/safe';
import together from '../utils/together';
import partial from '../utils/partial';
import defer from '../utils/defer';

import globals from './globals';
import { config } from './config';
import { bindEventServer } from './events';

import * as C from '../constants/index';

export const makeRunInstanceApi = (ctx, taskEvents, promise, promiseControl) => {
  
  const thisTask = ctx.task,
    { parentTask } = ctx,
    resolveSafe = safe(promiseControl.resolve),
    rejectSafe = safe(promiseControl.reject),
    runEvents = bindEventServer(promise),
    triggerBoth = together(runEvents.trigger, taskEvents.trigger);
  
  if (parentTask) {
    parentTask.childTask = thisTask;
  }
  
  return {
    setupInit(initFn) {

      if (config.trace) {
        console.log('setupInit', new Date() - 0);
      }

      if (C.SETTLED_STATES[ctx.state]) {
        return;
      }

      if (!type.isUndefined(initFn) && !type.isFunction(initFn)) {
        return signalError(C.ERROR_CODES.DESCRIPTION_INIT_FN_MISS);
      }

      ctx.initFn = safe(thisTask, initFn);
    },


    setupBody(bodyFn, needRepeat, timeout) {
      
      if (config.trace) {
        console.log('setupBody', new Date() - 0);
      }

      if (C.SETTLED_STATES[ctx.state]) {
        return;
      }

      if (!type.isFunction(bodyFn)) {
        return signalError(C.ERROR_CODES.DESCRIPTION_BODY_FN_MISS);
      }

      if (!type.isUndefined(needRepeat) && !type.isBoolean(needRepeat) && !type.isNumber(needRepeat)) {
        return signalError(C.ERROR_CODES.DESCRIPTION_BODY_REPEAT_WRONG);
      }

      if (!type.isUndefined(timeout) && !type.isNumber(timeout)) {
        return signalError(C.ERROR_CODES.DESCRIPTION_BODY_TIMEOUT_WRONG);
      }

      ctx.bodyFn = safe(thisTask, bodyFn);
      ctx.conditionsToMeet--;

      ctx.needRepeat = needRepeat;
      ctx.timeoutAmount = timeout;

    },

    setupFin(finallyFn) {
      if (config.trace) {
        console.log('setupFin', new Date() - 0);
      }

      if (C.SETTLED_STATES[ctx.state]) {
        return;
      }

      if (!type.isUndefined(finallyFn) && !type.isFunction(finallyFn)) {
        return signalError(C.ERROR_CODES.DESCRIPTION_FIN_FN_MISS);
      }

      ctx.finallyFn = safe(thisTask, finallyFn);
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
    
    ctx.state = C.STATE_NAMES.error;
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

  /**
   * Decreases a counter of running tasks
   * @param thisTask
   */
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