/**
 * Created by ANDREW on 6/4/2015.
 */
'use strict';

var __slice = [].slice;

var globals = require('./globals'),
  defer = require('./defer'),
  extend = require('./extend'),
  partial = require('./partial'),
  nextUid = require('./nextUid'),
  encapsulateRunInstance = require('./ctRunEncapsulateInst'),
  proceedDescriptionFn = require('./ctFnProceedDescription'),
  EVENT_NAMES = require('./constEventNames'),
  STATE_NAMES = require('./constStateNames'),
  Promise = require('promise-polyfill'); // jshint ignore:line

/**
 *
 * @param descriptionFn
 * @param taskEvents
 * @returns {Promise}
 */
function protoRun(descriptionFn, taskEvents) {
  var thisTask = this; // jshint ignore:line
  var parentTask = globals.staticParentTask;
  globals.staticParentTask = null;

  var instanceApi = {},
    runCtx = {
      task            : thisTask,
      id              : 'T_' + thisTask.id + ':' + nextUid(),
      conditionsToMeet: 1,
      state           : STATE_NAMES.init,
      runBlock        : 0,
      runArgs         : __slice.call(arguments, 2),
      descriptionFn   : descriptionFn,
      parentTask      : parentTask
    },
    encapsulation = null,
    promiseFn = function (_resolve, _reject) {

      encapsulation = partial(runCtx, encapsulateRunInstance,
        instanceApi, taskEvents, {
          resolve: _resolve,
          reject : _reject
        }
      );

      defer.call(runCtx, 0, proceedDescriptionFn, [instanceApi]);
    };

  return overloadPromise(
    new Promise(promiseFn),
    instanceApi,
    encapsulation
  );

}

function overloadPromise(promise, instanceApi, sealEncapsulationFn) {

  sealEncapsulationFn(promise);

  return extend(promise, {
    onError: partial(promise, instanceApi.runEventsOn, EVENT_NAMES.error),

    abort : partial(promise, instanceApi.abort),
    pause : partial(promise, instanceApi.pause),
    resume: partial(promise, instanceApi.resume),

    done  : partial(promise, instanceApi.runEventsOn, EVENT_NAMES.done),
    fail  : partial(promise, instanceApi.runEventsOn, EVENT_NAMES.fail),
    always: partial(promise, instanceApi.runEventsOn, [EVENT_NAMES.done, EVENT_NAMES.fail, EVENT_NAMES.error].join()),

    progress  : partial(promise, instanceApi.runEventsOn, EVENT_NAMES.progress)
  });
}

module.exports = protoRun;