/**
 * Created by ANDREW on 6/4/2015.
 */
'use strict';

var bindAll = require('./bindAll'),
  nextUid = require('./nextUid'),
  serveEvents = require('./events'),
  extend = require('./extend'),
  partial = require('./partial'),
  globals = require('./globals'),

  protoMethods = require('./ctProtoBoundMethods'),
  protoRun = require('./ctProtoRun'),
  CrunchTask = require('./typeCrunchtask'),
  EVENT_NAMES = require('./constEventNames');


globals.staticCTImpl = function (ctx, descriptionFn) {
  return prepareBlankTask(ctx, serveEvents(ctx), descriptionFn);
};


function prepareBlankTask(task, events, descriptionFn) {

  return extend(
    bindAll(task, task, protoMethods),
    {
      id       : nextUid(),
      timestamp: new Date() - 0,
      runCount : 0,

      run     : partial(task, protoRun, descriptionFn, events),
      onRun   : partial(events.on, EVENT_NAMES.run),
      onIdle  : partial(events.on, EVENT_NAMES.idle),
      onError : partial(events.on, EVENT_NAMES.error),
      done    : partial(events.on, EVENT_NAMES.done),
      fail    : partial(events.on, EVENT_NAMES.fail),
      always  : partial(events.on, [EVENT_NAMES.done, EVENT_NAMES.fail, EVENT_NAMES.error].join()),
      progress: partial(events.on, EVENT_NAMES.progress),

      _signalIdle: function () {
        if (!globals.staticSecurityLock) {
          return;
        }
        globals.staticSecurityLock = false;
        events.trigger(EVENT_NAMES.idle);
      }
    });
}

module.exports = CrunchTask;