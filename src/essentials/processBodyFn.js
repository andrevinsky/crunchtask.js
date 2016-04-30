/**
 * Created by andrew on 4/22/16.
 */
import type from '../utils/type';
import safe from '../utils/safe';
import together from '../utils/together';
import partial from '../utils/partial';
import defer from '../utils/defer';

import { config } from './config';

import * as C from '../constants/index';

export function processBodyFn(instanceApi, isFirstTime) {
  if (config.trace) {

    console.log('inside proceedBodyFn', this.id, new Date() - 0); // jshint ignore:line
    console.log('isFirstTime', isFirstTime);
    console.log('this.timeoutAmount', this.timeoutAmount); // jshint ignore:line
  }

  defer.call(this, isFirstTime ? 0 : this.timeoutAmount, function (instanceApi) { // jshint ignore:line

    if (config.trace) {
      console.log('inside proceedBodyFn:defer', this.id, new Date() - 0);
    }

    const task = this.task,
      needRepeat = this.needRepeat,
      timeLimit = type.isNumber(needRepeat) ? needRepeat : 0;

    let timerBatchStart,
      timerStart,
      miniRunCount = 0,
      timerElapsed = 0;

    let canExecuteNextLoop = (this.state === C.STATE_NAMES.running) && !task.isPaused && !task.isAborted,
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
          instanceApi.signalError(C.ERROR_CODES.TASK_BODY_INSIDE, ex);
        }

        timerElapsed += (new Date() - timerStart);
        miniRunCount++;

        canRepeatThisLoop = needRepeat && (timeLimit !== 0) &&
          (timerElapsed < timeLimit) && (this.state === C.STATE_NAMES.running);

      } while (canRepeatThisLoop);

    } else if (task.isAborted || this.state === C.STATE_NAMES.aborted) {
      instanceApi.reject('aborted');
    }

    canQueueNextBatch = needRepeat && C.NEED_REPEAT_STATES[this.state] && !task.isAborted;

    if (canQueueNextBatch) {
      this.runBlock++;
      if (config.trace) {
        console.log('rescheduling proceedBodyFn', this.id, new Date() - 0);
      }
      return processBodyFn.call(this, instanceApi);
    }

    if (needRepeat === false) {
      instanceApi.resolve();
    }

    if (this.finallyFn && !this.finallyFn.call(this, C.VERBOSE_STATES[this.state])) {
      instanceApi.signalError(C.ERROR_CODES.TASK_FIN_INSIDE, this.status);
    }

  }, [instanceApi]);
}
