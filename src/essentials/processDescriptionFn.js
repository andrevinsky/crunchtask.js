/**
 * Created by andrew on 4/22/16.
 */
import * as C from '../constants/index';

import { config } from './config';
import globals from './globals';
import { processBodyFn } from './processBodyFn';

import safe from '../utils/safe';
// import defer from '../utils/defer';

const doTrace = config.trace;

export function processDescriptionFn(instanceApi) {
  
  const ctx = this, // jshint ignore:line
    thisTask = ctx.task,
    descriptionFn = ctx.descriptionFn;

  if (!descriptionFn) {
    return instanceApi.signalError(C.ERROR_CODES.DESCRIPTION_FN_MISS, 'Description function is empty. Ctx:' + JSON.stringify(ctx));
  }

  if (doTrace) {
    console.log('before descriptionFn run', new Date() - 0);
  }

  if (safe(thisTask, descriptionFn)(
      instanceApi.setupInit,
      instanceApi.setupBody,
      instanceApi.setupFin
    ) &&
    (!C.SETTLED_STATES[ctx.state]) &&
    (ctx.conditionsToMeet === 0)) {

    if (doTrace) {
      console.log('after descriptionFn run', new Date() - 0);
    }

    let { needRepeat } = ctx;

    needRepeat = ((needRepeat === false) ? needRepeat
      : ((needRepeat === 0) ? needRepeat : needRepeat || config.timeLimit));

    ctx.needRepeat = (needRepeat === 0) ? true : needRepeat;
    ctx.timeoutAmount = ctx.timeoutAmount || config.timeoutAmount;

    if (doTrace) {
      console.log('collected `needRepeat`:', ctx.needRepeat);
      console.log('collected `timeoutAmount`:', ctx.timeoutAmount);
    }

    instanceApi.goRunning();

    if (doTrace) {
      console.log('before Init', new Date() - 0);
    }
    
    if (this.initFn && !this.initFn.apply(this, this.runArgs)) {
      instanceApi.signalError(C.ERROR_CODES.TASK_INIT_INSIDE);
    }
    
    if (doTrace) {
      console.log('after Init +..',
        'before processBodyFn', new Date() - 0);
    }

    processBodyFn.call(this, instanceApi, true);


  } else {

    const error = globals.staticLastSafeError;
    delete globals.staticLastSafeError;
    // bad outcome, reject
    return instanceApi.signalError(C.ERROR_CODES.DESCRIPTION_INSIDE, error.message);
  }

}