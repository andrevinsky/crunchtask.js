/**
 * Created by andrew on 4/21/16.
 */
import { config } from './config';
import type from '../utils/type';


/**
 * Subscribes a handler `fn(args..)` to a comma-separated event list. Events are scoped by the object `hive`
 * @param {Object} hive
 * @param {string} evt
 * @param {function} fn
 * @param {*[]} [args]
 */
function on(hive, evt, fn, ...args) {
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
 * @param {Object} hive
 * @param {string} evt
 * @params {*[]} [args]
 */
function trigger(hive, evt, ...args) {

  if (!hive[evt]) {
    return;
  }

  const handlers = hive[evt];
  for (let i = 0, maxI = handlers.length; i < maxI; i++) {
    let [handler, args0] = handlers[i];

    if (!handler) {
      continue;
    }

    try {
      handler.apply(this, [].concat(args0, args)); // jshint ignore:line
    } catch (e) {
      if (config.debug) {
        console.log(e + ', stack: ' + e.stack);
      }
    }
  }
}

/**
 *
 * @param {Object} ctx
 * @param {Object} hive
 * @returns {{on: {Function}, trigger: {Function}}}
 */
export function bindEventServer(ctx, hive = {}) {
  return {
    on     : on.bind(ctx, hive),
    trigger: trigger.bind(ctx, hive)
  };
}