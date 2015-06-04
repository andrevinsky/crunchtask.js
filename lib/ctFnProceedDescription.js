/**
 * Created by ANDREW on 6/4/2015.
 */
'use strict';

var defer = require('./defer'),
  safe = require('./safe'),
  config = require('./config').config,
  proceedBodyFn = require('./ctFnProceedBody'),

  SETTLED_STATES = require('./constSettledStates');


function proceedDescriptionFn(instanceApi) {

  var ctx = this, // jshint ignore:line
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
    (!SETTLED_STATES[ctx.state]) &&
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
      proceedBodyFn.call(this, instanceApi, true);

    });

  } else {
    // bad outcome, reject
    return instanceApi.signalError('CrunchTask.description.else', '');
  }
}


module.exports = proceedDescriptionFn;