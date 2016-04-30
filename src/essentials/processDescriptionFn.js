/**
 * Created by andrew on 4/22/16.
 */
import * as C from '../constants/index';

import { config } from './config';
import globals from './globals';
import { processBodyFn } from './processBodyFn';

import safe from '../utils/safe';
import defer from '../utils/defer';

export function processDescriptionFn(instanceApi) {
  const ctx = this, // jshint ignore:line
    thisTask = ctx.task,
    descriptionFn = ctx.descriptionFn;

  if (!descriptionFn) {
    return instanceApi.signalError(C.ERROR_CODES.DESCRIPTION_FN_MISS, 'Description function is empty. Ctx:' + JSON.stringify(ctx));
  }

  if (config.trace) {
    console.log('before descriptionFn run', new Date() - 0);
  }

  if (safe(thisTask, descriptionFn)(
      instanceApi.setupInit,
      instanceApi.setupBody,
      instanceApi.setupFin
    ) &&
    (!C.SETTLED_STATES[ctx.state]) &&
    (ctx.conditionsToMeet === 0)) {

    if (config.trace) {
      console.log('after descriptionFn run', new Date() - 0);
    }

    let needRepeat = ctx.needRepeat;

    needRepeat = ((needRepeat === false) ? needRepeat
      : ((needRepeat === 0) ? needRepeat : needRepeat || config.timeLimit));

    ctx.needRepeat = (needRepeat === 0) ? true : needRepeat;
    ctx.timeoutAmount = ctx.timeoutAmount || config.timeoutAmount;

    if (config.trace) {
      console.log('collected `needRepeat`:', ctx.needRepeat);
      console.log('collected `timeoutAmount`:', ctx.timeoutAmount);
    }

    instanceApi.goRunning();

    if (config.trace) {
      console.log('before deferred Init + Body scheduler', new Date() - 0);
    }

    // schedule init, body, fin, etc.
    defer.call(ctx, 0, function () {

      if (config.trace) {
        console.log('inside deferred Init + Body scheduler. With args:', new Date() - 0, this.runArgs.join());
      }

      if (this.initFn && !this.initFn.apply(this, this.runArgs)) {
        instanceApi.signalError(C.ERROR_CODES.TASK_INIT_INSIDE);
      }

      if (config.trace) {
        console.log('before  proceedBodyFn', new Date() - 0);
      }

      processBodyFn.call(this, instanceApi, true);

    });

  } else {

    const error = globals.staticLastSafeError;
    delete globals.staticLastSafeError;
    // bad outcome, reject
    return instanceApi.signalError(C.ERROR_CODES.DESCRIPTION_INSIDE, error.message);
  }

}