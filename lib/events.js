/**
 * Created by ANDREW on 6/3/2015.
 */
'use strict';

var __slice = [].slice;
var bind = require('./bind'),
  configs = require('./config');

var config = configs.config;

/**
 * Subscribes a handler `fn(args..)` to a comma-separated event list. Events are scoped by the object `hive`
 * @param hive
 * @param evt
 * @param fn*
 * @private
 */
function _on(hive, evt, fn) {
  if (!fn) {
    return;
  }
  var args = __slice.call(arguments, 3),
    evts = evt.split(/\s*,\s*/),
    evtName,
    handlers;
  while ((evtName = evts.shift())) {
    if ((handlers = hive[evtName])) {
      handlers.push([fn, args]);
    } else {
      hive[evtName] = [[fn, args]];
    }
  }
}

/**
 * Executes all subscribers for `evt` event, scoped by the `hive` object with the supplied arguments
 * @param hive
 * @param evt
 * @params {...*} args
 * @private
 */
function _trigger(hive, evt /*, args*/) {
  var args1 = __slice.call(arguments, 2);
  if (!hive[evt]) {
    return;
  }
  var handlers = hive[evt];
  for (var handler, args0, i = 0, maxI = handlers.length; i < maxI; i++) {
    handler = handlers[i][0];
    args0 = handlers[i][1];
    if (!handler) {
      continue;
    }
    try {
      handler.apply(this, [].concat(args0, args1)); // jshint ignore:line
    } catch (e) {
      if (config.debug) {
        console.log(e + ', stack: ' + e.stack);
      }
    }
  }
}

function serveEvents(ctx, _obj) {
  var obj = _obj || {};
  return {
    on     : bind(ctx, _on, obj),
    trigger: bind(ctx, _trigger, obj)
  };
}


module.exports = serveEvents;