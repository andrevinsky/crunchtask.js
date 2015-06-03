/**
 * @preserve
 * @module CrunchTask
 * Created by AndrewRevinsky on 10/10/2014.
 */
(function () {

  'use strict';

  /* jshint -W040 */

  var root = typeof window === 'object' && window ? window : (((typeof process !== 'undefined') && (typeof module !== 'undefined' && module.exports)) ? module.exports : {}),
    __slice = [].slice,
    __hasOwnProperty = {}.hasOwnProperty;

  var type = require('./type'),
    mirror = require('./mirror'),
    arrayToObject = require('./arrayToObject'),
    extend = require('./extend'),
    partial = require('./partial'),
    bind = require('./bind'),
    serveEvents = require('./events'),
    configs = require('./config'),
    error = require('./error'),
    together = require('./together'),
    defer = require('./defer'),
    safe = require('./safe'),
    globals = require('./globals'),
    Range = require('./typeRange');

  var Promise = require('promise-polyfill');

  if (Promise === false) {
    error('Linking', 'Dependency isn\'t met: "promise-polyfill"');
  }

  var config = configs.config,
    defaultConfig = configs.defaultConfig;

  root.CrunchTask = CrunchTask;


  extend(CrunchTask, {
    /**
     * @deprecated use range
     * @type {staticFor}
     */
    'for': staticFor,
    range: staticFor,
    rangeCheck: normalizeRanges,

    /**
     * @deprecated use range
     * @type {Range}
     */
    rangeNextAndCheck: function(range, checkOnly) {
      return range.canAdvance(checkOnly);
    },

    forEach: staticForEach,
    reduce: staticReduce,

    /**
     *
     * @param {{boolean}|{ timeLimit:Number, timeoutAmount:Number, debug:boolean }} obj
     */
    config: function _config(obj) {
      if (!type.isObject(obj)) {
        return _config(defaultConfig);
      }
      var result = {};
      for (var prop in obj) {
        //noinspection JSUnfilteredForInLoop
        if (__hasOwnProperty.call(obj, prop) && __hasOwnProperty.call(config, prop)) {
          //noinspection JSUnfilteredForInLoop
          config[prop] = obj[prop];
          //noinspection JSUnfilteredForInLoop
          result[prop] = obj[prop];
        }
      }
      return result;
    }
  });

  CrunchTask.config(false);

  var uid = 0;

  /**
   * Generates new id.
   * @returns {number}
   */
  function nextUid() {
    return ++uid;
  }

  var EVENT_NAMES = mirror({
      run     : null,
      done    : null,
      fail    : null,
      abort   : null,
      error   : null,
      progress: null,
      idle    : null
    }, 'event.'),
    STATE_NAMES = mirror({
      init    : null,
      error   : null,
      running : null,
      paused  : null,
      resolved: null,
      rejected: null,
      aborted : null
    }, 'state.'),
    SETTLED_STATES = arrayToObject([
      STATE_NAMES.error,
      STATE_NAMES.resolved,
      STATE_NAMES.rejected,
      STATE_NAMES.aborted
    ], true),
    NEED_REPEAT_STATES = arrayToObject([
      STATE_NAMES.running,
      STATE_NAMES.paused
    ], true),
    VERBOSE_STATES = arrayToObject([
      STATE_NAMES.resolved, STATE_NAMES.rejected,
      STATE_NAMES.error, STATE_NAMES.aborted
    ], [
      'success', 'failure',
      'error', 'aborted'
    ]);

  /**
   *
   * @param descriptionFn
   * @param taskEvents
   * @returns {Promise}
   */
  function protoRun(descriptionFn, taskEvents) {
    var thisTask = this;
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

    return overloadPromise(new Promise(promiseFn), instanceApi, encapsulation);

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

  function encapsulateRunInstance(instanceApi, taskEvents, resolveReject, promise) {

    var ctx = this,
      thisTask = ctx.task,
      parentTask = ctx.parentTask,
      resolveSafe = safe(resolveReject.resolve),
      rejectSafe = safe(resolveReject.reject),
      runEvents = serveEvents(promise),
      triggerBoth = together(runEvents.trigger, taskEvents.trigger);

    if (parentTask) {
      parentTask.childTask = thisTask;
    }

    return extend(instanceApi, {

      /**
       *
       * @param _initFn
       * @returns {*}
       */
      setupInit: function (_initFn) {
        if (config.trace) {
          console.log('setupInit', new Date() - 0);
        }

        if (SETTLED_STATES[ctx.state]) {
          return;
        }

        if (!type.isUndefined(_initFn) && !type.isFunction(_initFn)) {
          return signalError('CrunchTask.description.initSetup', 'Init setup expects an optional function.');
        }

        ctx.initFn = safe(thisTask, _initFn);
      },

      /**
       *
       * @param _bodyFn
       * @param _needRepeat
       * @param _timeout
       * @returns {*}
       */
      setupBody: function (_bodyFn, _needRepeat, _timeout) {
        if (config.trace) {
          console.log('setupBody', new Date() - 0);
        }
        if (SETTLED_STATES[ctx.state]) {
          return;
        }

        if (!type.isFunction(_bodyFn)) {
          return signalError('CrunchTask.description.bodySetup', 'Body setup expects a function as a first optional arg.');
        }

        if (!type.isUndefined(_needRepeat) && !type.isBoolean(_needRepeat) && !type.isNumber(_needRepeat)) {
          return signalError('CrunchTask.description.bodySetup', 'Body setup expects a number or false as a 2nd optional arg.');
        }

        if (!type.isUndefined(_timeout) && !type.isNumber(_timeout)) {
          return signalError('CrunchTask.description.bodySetup', 'Body setup expects a number as a 3rd optional arg.');
        }

        ctx.bodyFn = safe(thisTask, _bodyFn);
        ctx.conditionsToMeet--;

        ctx.needRepeat = _needRepeat;
        ctx.timeoutAmount = _timeout;
      },

      /**
       *
       * @param _finallyFn
       * @returns {*}
       */
      setupFin: function (_finallyFn) {
        if (config.trace) {
          console.log('setupFin', new Date() - 0);
        }
        if (SETTLED_STATES[ctx.state]) {
          return;
        }
        if (!type.isUndefined(_finallyFn) && !type.isFunction(_finallyFn)) {
          return signalError('CrunchTask.description.finSetup', 'Fin setup expects a function as a first optional arg.');
        }
        ctx.finallyFn = safe(thisTask, _finallyFn);
      },

      signalError: signalError,

      runEventsOn: runEvents.on,
      //onError: partial(runEvents.on, EVENT_NAMES.error),
      //onDone: partial(runEvents.on, EVENT_NAMES.done),
      //onFail: partial(runEvents.on, EVENT_NAMES.fail),
      //onAlways: partial(runEvents.on, [EVENT_NAMES.done,EVENT_NAMES.fail].join()),

      /**
       *
       */
      goRunning: function () {
        thisTask.runCount++;
        ctx.state = STATE_NAMES.running;
        taskEvents.trigger(EVENT_NAMES.run, ctx.id); // no need to call runInst
      },
      /**
       *
       */
      resolve  : function () {
        if (SETTLED_STATES[ctx.state]) {
          return;
        }
        var args0 = __slice.call(arguments, 0);
        ctx.state = STATE_NAMES.resolved;
        ctx.value = args0;

        decreaseRunning(thisTask);

        signalGeneric(args0, EVENT_NAMES.done, resolveSafe);
      },
      /**
       *
       */
      reject   : function () {

        if (SETTLED_STATES[ctx.state]) {
          return;
        }
        var args0 = __slice.call(arguments, 0);
        ctx.state = STATE_NAMES.rejected;
        ctx.value = args0;

        decreaseRunning(thisTask);

        signalGeneric(args0, EVENT_NAMES.fail, rejectSafe);
      },
      abort    : function () {
        if (SETTLED_STATES[ctx.state]) {
          return;
        }
        ctx.state = STATE_NAMES.aborted;
        return this;
      },

      pause: function () {
        if (SETTLED_STATES[ctx.state]) {
          return;
        }
        ctx.state = STATE_NAMES.paused;
        return this;
      },

      resume: function () {
        if (SETTLED_STATES[ctx.state]) {
          return;
        }
        ctx.state = STATE_NAMES.running;
        return this;
      },

      sendNotify: partial(triggerBoth, EVENT_NAMES.progress)

    });

    function signalError() {
      if (SETTLED_STATES[ctx.state]) {
        return;
      }

      var args0 = __slice.call(arguments, 0);
      ctx.state = STATE_NAMES.error;
      ctx.value = args0;

      signalGeneric(args0, EVENT_NAMES.error, rejectSafe);
    }

    function signalGeneric(args0, eventName, actionFn) {

      triggerBoth.apply(this, [eventName].concat(args0));

      if (actionFn) {
        defer.call(thisTask, 0, actionFn, [args0]);
      }
    }

    function signalTwoParties(taskC, taskP) {
      defer(1, function () {
        if ((taskC.runCount + taskP.runCount) > 0) {
          return;
        }
        globals.staticSecurityLock = true;
        taskC._signalIdle();
        globals.staticSecurityLock = true;
        taskP._signalIdle();

        delete ctx.parentTask;
        delete taskP.childTask;

      });
    }

    function decreaseRunning(thisTask) {
      thisTask.runCount = Math.max(0, thisTask.runCount - 1);
      if (thisTask.runCount) {
        return;
      }

      delete thisTask.isAborted;
      delete thisTask.isPaused;

      if (thisTask.childTask) {
        signalTwoParties(thisTask.childTask, thisTask);
      } else if (ctx.parentTask) {
        signalTwoParties(thisTask, ctx.parentTask);
      } else {
        defer(1, function() {
          if (thisTask.runCount) {
            return;
          }
          globals.staticSecurityLock = true;
          thisTask._signalIdle();
        });
      }

    }

  }


  function proceedDescriptionFn(instanceApi) {

    var ctx = this,
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

  function proceedBodyFn(instanceApi, isFirstTime) {
    if (config.trace) {
      console.log('inside proceedBodyFn', this.id, new Date() - 0);
      console.log('isFirstTime', isFirstTime);
      console.log('this.timeoutAmount', this.timeoutAmount);
    }
    defer.call(this, isFirstTime ? 0 : this.timeoutAmount, function (instanceApi) {

      if (config.trace) {
        console.log('inside proceedBodyFn:defer', this.id, new Date() - 0);
      }

      var task = this.task,
        needRepeat = this.needRepeat,
        timeLimit = type.isNumber(needRepeat) ? needRepeat : 0;

      var timerBatchStart,
        timerStart,
        miniRunCount = 0,
        timerElapsed = 0;

      var canExecuteNextLoop = (this.state === STATE_NAMES.running) && !task.isPaused && !task.isAborted,
        canRepeatThisLoop,
        canQueueNextBatch;

      if (canExecuteNextLoop) {
        timerBatchStart = new Date();
        do {

          try {
            timerStart = new Date();
            this.bodyFn(instanceApi.resolve, instanceApi.reject, instanceApi.sendNotify, {
              batchStarted: timerBatchStart,
              batchIndex  : miniRunCount,
              batchElapsed: timerElapsed,
              runBlock    : this.runBlock
            });

          } catch (ex) {
            if (config.debug) {
              console.log(ex + ', stack: ' + ex.stack);
            }
            instanceApi.signalError('body', ex);
          }

          timerElapsed += (new Date() - timerStart);
          miniRunCount++;

          canRepeatThisLoop = needRepeat && (timeLimit !== 0) &&
            (timerElapsed < timeLimit) && (this.state === STATE_NAMES.running);

        } while (canRepeatThisLoop);

      } else if (task.isAborted || this.state === STATE_NAMES.aborted) {
        instanceApi.reject('aborted');
      }

      canQueueNextBatch = needRepeat && NEED_REPEAT_STATES[this.state] && !task.isAborted;

      if (canQueueNextBatch) {
        this.runBlock++;
        if (config.trace) {
          console.log('rescheduling proceedBodyFn', this.id, new Date() - 0);
        }
        return proceedBodyFn.call(this, instanceApi);
      }

      if (needRepeat === false) {
        instanceApi.resolve();
      }

      if (this.finallyFn && !this.finallyFn.call(this, VERBOSE_STATES[this.state])) {
        instanceApi.signalError('CrunchTask.description.fin', this.status);
      }

    }, [instanceApi]);
  }

  function protoAbort() {
    this.isAborted = true;
    return this;
  }

  function protoPause() {
    this.isPaused = true;
    return this;
  }

  function protoResume() {
    delete this.isPaused;
    return this;
  }

  function protoThen(descriptionFn /*, tasks..*/){
    var args0 = __slice.call(arguments, 1), _newTask;
    try {
      return (_newTask = new CrunchTask(descriptionFn));
    } finally {
      _newTask.done(doneHandler);
      this.done(doneHandler);
    }

    function doneHandler() {
      var args1 = __slice.call(arguments, 0), task;
      while ((task = args0.shift())) {
        getExecutableFor(task)(args1);
      }
    }
  }


  /**
   *
   * @callback descriptionFunc
   * @param {function} initSetup
   * @param {function} bodySetup
   * @param {function} finSetup
   */
  /**
   *
   * @param {descriptionFunc} descriptionFn
   * @returns {CrunchTask}
   * @constructor
   */
  function CrunchTask(descriptionFn) {
    // always dealing with the `new` keyword instantiation
    if (!(this instanceof CrunchTask)) {
      return new CrunchTask(descriptionFn);
    }

    return prepareBlankTask(this, serveEvents(this), descriptionFn);
  }

  function prepareBlankTask(task, events, descriptionFn) {
    return extend(task, {
      id       : nextUid(),
      timestamp: new Date() - 0,
      runCount : 0,
      isIdle   : function isIdle() {
        return task.runCount === 0;
      },

      pause : bind(task, protoPause),
      resume: bind(task, protoResume),
      abort : bind(task, protoAbort),

      run : partial(task, protoRun, descriptionFn, events),
      then: partial(task, protoThen),

      onRun   : partial(events.on, EVENT_NAMES.run),
      onIdle  : partial(events.on, EVENT_NAMES.idle),
      onError : partial(events.on, EVENT_NAMES.error),
      done    : partial(events.on, EVENT_NAMES.done),
      fail    : partial(events.on, EVENT_NAMES.fail),
      always  : partial(events.on, [EVENT_NAMES.done, EVENT_NAMES.fail, EVENT_NAMES.error].join()),
      progress: partial(events.on, EVENT_NAMES.progress),
      _signalIdle: function(){
        if (!globals.staticSecurityLock) { return; }
        globals.staticSecurityLock = false;
        events.trigger(EVENT_NAMES.idle);
      }
    });
  }


  /**
   *
   * @param val
   * @returns {boolean}
   */
  function isExecutable(val) {
    return type.isFunction(val) || (val instanceof CrunchTask);
  }


  //noinspection JSCommentMatchesSignature,JSValidateJSDoc
  /**
   * @param {number} [start]
   * @param {number} [finish]
   * @param {number} [increment]
   * @param {boolean} [inclusive]
   * @param {function|CrunchTask} fnBody
   * @param {function|CrunchTask} fnTail
   * @returns {CrunchTask}
   */
  function staticFor(/*{start, finish, increment, inclusive, } * n, fnBody, {fnTail}*/) {
    var argsCount = arguments.length,
      fnCount = 0;

    while (isExecutable(arguments[argsCount - 1 - fnCount])) {
      fnCount++;
    }

    var args = __slice.call(arguments, 0, argsCount - fnCount),
      fns = __slice.call(arguments, -fnCount),
      ranges = new Range(args),
      taskBody = fns[0],
      taskTail = fns[1] || function () {
        };

    if (!taskBody) {
      return resolvedTask();
    }

    return internalFor(ranges, taskBody, taskTail);
  }

  function staticForEach(arr, taskBody, taskTail) {
    return new CrunchTask(function (init, body, fin) {
      var ranges,
        ptr,
        arrInternal = arr,
        canRunCycle,
        bodyFn = getExecutableFor(taskBody, this),
        tailFn = getExecutableFor(taskTail, this);

      init(function (_arr) {
        if (_arr) {
          arrInternal = arr;
        }
        ranges = new Range([0, arrInternal.length]);
        canRunCycle = ranges.canAdvance(true);
      });

      body(function (resolve) {
        if (canRunCycle) {
          ptr = ranges.valueOf()[0];
          bodyFn([arrInternal[ptr], ptr]);
        }
        if (!canRunCycle || !ranges.canAdvance()) {
          resolve();
        }
      }, config.timeLimit, config.timeoutAmount);

      fin(function () {
        tailFn(ranges.valueOf());
      });
    });
  }

  function staticReduce(arr, memo, taskBody, taskTail) {
    return new CrunchTask(function (init, body, fin) {
      var ranges,
        ptr,
        arrInternal = arr,
        memoInternal = memo,
        canRunCycle,
        bodyFn = getExecutableFor(taskBody, this),
        tailFn = getExecutableFor(taskTail, this);

      init(function (_arr, _memo) {
        if (_arr) {
          arrInternal = arr;
        }
        ranges = new Range([0, arrInternal.length]);
        canRunCycle = ranges.canAdvance(true);
        if (!type.isUndefined(_memo)) {
          memoInternal = _memo;
        }
      });

      body(function (resolve) {
        if (canRunCycle) {
          ptr = ranges.valueOf()[0];
          memoInternal = bodyFn([memoInternal, arrInternal[ptr], ptr]);
        }
        if (!canRunCycle || !ranges.canAdvance()) {
          resolve(memoInternal);
        }
      }, config.timeLimit, config.timeoutAmount);

      fin(function () {
        tailFn(memoInternal, ranges.valueOf());
      });
    });
  }

  function normalizeRanges() {
    var args = __slice.call(arguments, 0);
    return new Range(args);
  }

  function internalFor(_ranges, taskBody, taskTail) {
    return new CrunchTask(function (init, body, fin) {
      var ranges = _ranges, canRunCycle,
        bodyFn = getExecutableFor(taskBody, this),
        tailFn = getExecutableFor(taskTail, this);

      init(function () {
        var args = __slice.call(arguments, 0);
        if (args.length) {
          ranges = new Range(args);
        }
        canRunCycle = ranges.canAdvance(true);
      });

      body(function (resolve) {
        if (canRunCycle) {
          bodyFn(ranges.valueOf());
        }
        if (!canRunCycle || !ranges.canAdvance()) {
          resolve();
        }
      }, config.timeLimit, config.timeoutAmount);

      fin(function () {
        tailFn(ranges.valueOf());
      });
    });
  }

  function resolvedTask() {
    return new CrunchTask(function (init, body) {
      body(function (resolve) {
        resolve();
      });
    });
  }

  function getExecutableFor(task, ctx) {
    if (type.isFunction(task)) {
      return function (args) {
        return task.apply(ctx || this, args);
      };
    } else if (task instanceof CrunchTask) {
      return function (args) {
        globals.staticParentTask = ctx;
        return task.run.apply(task, args);
      };
    } else {
      return function (k) {
        return k;
      };
    }
  }

})();
