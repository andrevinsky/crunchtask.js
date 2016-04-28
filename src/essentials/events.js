/**
 * Created by andrew on 4/21/16.
 */
import { config } from './config';
import type from '../utils/type';


/**
 * Subscribes a handler `fn(args..)` to a comma-separated event list. Events are scoped by the object `hive`
 * @param hive {}
 * @param evt ''
 * @param fn*
 * @param [args]
 */
function _on(hive, evt, fn, ...args) {
  if (!fn && !type.isFunction(fn)) {
    return;
  }
  
  let 
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
 * @params {...*} args1
 */
function _trigger(hive, evt, ...args1) {
  // var args1 = __slice.call(arguments, 2);
  if (!hive[evt]) {
    return;
  }
  const handlers = hive[evt];
  for (let handler, args0, i = 0, maxI = handlers.length; i < maxI; i++) {
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

/**
 *
 * @param ctx {{}}
 * @param _obj {{}}
 * @returns {{on: {Function}, trigger: {Function}}}
 */
export function bindEventServer(ctx, obj = {}) {
  return {
    on     : _on.bind(ctx, obj),
    trigger: _trigger.bind(ctx, obj)
  };
}