/**
 * Created by ANDREW on 6/4/2015.
 */
'use strict';

var __slice = [].slice;

var type = require('./type'),
  globals = require('./globals'),
  defer = require('./defer'),
  partial = require('./partial'),
  safe = require('./safe'),
  config = require('./config').config,
  STATE_NAMES = require('./constStateNames'),
  NEED_REPEAT_STATES = require('./constNeedRepeatStates'),
  VERBOSE_STATES = require('./constVerboseStates');


function proceedBodyFn(instanceApi, isFirstTime) {
  if (config.trace) {

    console.log('inside proceedBodyFn', this.id, new Date() - 0); // jshint ignore:line
    console.log('isFirstTime', isFirstTime);
    console.log('this.timeoutAmount', this.timeoutAmount); // jshint ignore:line
  }
  defer.call(this, isFirstTime ? 0 : this.timeoutAmount, function (instanceApi) { // jshint ignore:line

    if (config.trace) {
      console.log('inside proceedBodyFn:defer', this.id, new Date() - 0);
    }

    var task = this.task,
      needRepeat = this.needRepeat,
      timeLimit = type.isNumber(needRepeat) ? needRepeat : 0;

    var timerBatchStart,
      timerStart,
      miniRunCount = 0,
      timerElapsed = 0;

    var canExecuteNextLoop = (this.state === STATE_NAMES.running) && !task.isPaused && !task.isAborted,
      canRepeatThisLoop,
      canQueueNextBatch;

    if (canExecuteNextLoop) {
      timerBatchStart = new Date();
      do {

        try {
          timerStart = new Date();
          this.bodyFn(instanceApi.resolve, instanceApi.reject, instanceApi.sendNotify, {
            batchStarted: timerBatchStart,
            batchIndex  : miniRunCount,
            batchElapsed: timerElapsed,
            runBlock    : this.runBlock
          });

        } catch (ex) {
          if (config.debug) {
            console.log(ex + ', stack: ' + ex.stack);
          }
          instanceApi.signalError('body', ex);
        }

        timerElapsed += (new Date() - timerStart);
        miniRunCount++;

        canRepeatThisLoop = needRepeat && (timeLimit !== 0) &&
          (timerElapsed < timeLimit) && (this.state === STATE_NAMES.running);

      } while (canRepeatThisLoop);

    } else if (task.isAborted || this.state === STATE_NAMES.aborted) {
      instanceApi.reject('aborted');
    }

    canQueueNextBatch = needRepeat && NEED_REPEAT_STATES[this.state] && !task.isAborted;

    if (canQueueNextBatch) {
      this.runBlock++;
      if (config.trace) {
        console.log('rescheduling proceedBodyFn', this.id, new Date() - 0);
      }
      return proceedBodyFn.call(this, instanceApi);
    }

    if (needRepeat === false) {
      instanceApi.resolve();
    }

    if (this.finallyFn && !this.finallyFn.call(this, VERBOSE_STATES[this.state])) {
      instanceApi.signalError('CrunchTask.description.fin', this.status);
    }

  }, [instanceApi]);
}



module.exports = proceedBodyFn;