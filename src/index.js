/**
 * Created by andrew on 4/19/16.
 */
// import 'core-js/modules/es6.promise';
// import Promise from 'core-js/fn/promise';

import * as C from './constants/index';
import nextUid from './utils/nextUid';
import type from './utils/type';
import partial from './utils/partial';
import globals from './utils/globals';
import { getExecutableFor } from './essentials/executables';
import { serveEvents } from './essentials/events';


class CrunchInstancePromise {
  constructor(fn) {
    return new Promise(fn);
  }
}

class CrunchInstance extends CrunchInstancePromise {
  constructor(parentTask, descriptionFn, events, args) {
    let taskResolve, taskReject;
    super((rs, rj) => {
      taskResolve = rs;
      taskReject = rj;
    });
    
    // const runCtx = {
    //   task: this,
    //   parentTask,
    //   id: `T_${parentTask.id}:${nextUid()}`,
    //   conditionsToMeet: 1,
    //   state: C.STATE_NAMES.init,
    //   runBlock: 0,
    //   runArgs: args,
    //   descriptionFn
    // };

  }
}
class CrunchExec {
  constructor(descriptionFn) {
    let result, events;
    try {
      return (result = (...args) => new CrunchInstance(this, descriptionFn, events, args ));
    } finally {
      result.events = events = serveEvents(result);
    }
  }
}

class Crunchtask extends CrunchExec {
  constructor(descriptionFn) {
    const then = (...tasks) => {
      const doneHandler = (...args) => {
        let task;
        while (task = (tasks || []).shift()) {
          getExecutableFor(task)(args);
        }
      };
      let newTask;
      try {
        newTask = new Crunchtask(descriptionFn);
      }
      finally {
        newTask.done(doneHandler);
        this.done(doneHandler);
      }
    };

    super(descriptionFn);

    const events = this.events;
    delete this.events;
    
    Object.assign(this, {
      id: nextUid(),
      timestamp: new Date() - 0,
      runCount: 0,
      then,
      onRun: partial(events.on, C.EVENT_NAMES.run),
      onIdle: partial(events.on, C.EVENT_NAMES.idle),
      onError: partial(events.on, C.EVENT_NAMES.error),
      done: partial(events.on, C.EVENT_NAMES.done),
      fail: partial(events.on, C.EVENT_NAMES.fail),
      always: partial(events.on, [
        C.EVENT_NAMES.done, C.EVENT_NAMES.fail, C.EVENT_NAMES.error
      ].join()),
      progress: partial(events.on, C.EVENT_NAMES.progress),
      isIdle: () => this.runCount === 0,
      pause: () => {
        this.isPaused = true;
        return this;
      },
      resume: () =>{
        delete this.isPaused;
        return this;
      },
      abort: () => {
        this.isAborted = true;
        return this;
      },
      _signalIdle() {
        if (!globals.staticSecurityLock) {
          return;
        }
        globals.staticSecurityLock = false;
        events.trigger(C.EVENT_NAMES.idle);
      }
    });
  }
}

Object.assign(type, {
  isBuddy(input) {
    return input instanceof Crunchtask;
  }
});

export default Crunchtask;