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
import { processBodyFn } from './processBodyFn';

export function processDescriptionFn(instanceApi) {
  const ctx = this, // jshint ignore:line
    thisTask = ctx.task,
    descriptionFn = ctx.descriptionFn;

  if (!descriptionFn) {
    return instanceApi.signalError('CrunchTask.description.empty', 'Description function is empty.');
  }

  if (config.trace) {
    console.log('before descriptionFn run', new Date() - 0);
  }

  if (safe(thisTask, descriptionFn)(
      instanceApi.setupInit,
      instanceApi.setupBody,
      instanceApi.setupFin) &&
    (!C.SETTLED_STATES[ctx.state]) &&
    (ctx.conditionsToMeet === 0)) {

    if (config.trace) {
      console.log('after descriptionFn run', new Date() - 0);
    }

    var _needRepeat = ctx.needRepeat;
    _needRepeat = ((_needRepeat === false) ? _needRepeat
      : ((_needRepeat === 0) ? _needRepeat : _needRepeat || config.timeLimit));

    ctx.needRepeat = (_needRepeat === 0) ? true : _needRepeat;
    ctx.timeoutAmount = ctx.timeoutAmount || config.timeoutAmount;

    if (config.trace) {
      console.log('collected `needRepeat`:', ctx.needRepeat);
      console.log('collected `timeoutAmount`:', ctx.timeoutAmount);
    }

    instanceApi.goRunning();

    if (config.trace) {
      console.log('before defer', new Date() - 0);
    }

    // schedule init, body, fin, etc.
    defer.call(ctx, 0, function () {

      if (config.trace) {
        console.log('inside defer', new Date() - 0);
      }

      if (this.initFn && !this.initFn.apply(this, this.runArgs)) {
        instanceApi.signalError('CrunchTask.description.init');
      }
      if (config.trace) {
        console.log('before  proceedBodyFn', new Date() - 0);
      }
      processBodyFn.call(this, instanceApi, true);

    });

  } else {
    // bad outcome, reject
    return instanceApi.signalError('CrunchTask.description.else', '');
  }

}