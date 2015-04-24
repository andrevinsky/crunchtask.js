/**
 * @preserve
 * Created by ANDREW on 10/10/2014.
 * @requires 'bower_components/promise-polyfill'
 */
(function () {

  'use strict';

  /* jshint -W040 */

  var root = typeof window === 'object' && window ? window : global,
    __slice = [].slice,
    __hasOwnProperty = {}.hasOwnProperty;

  var type = (/**
   *
   * @returns {{isFunction(),isArray(),isBoolean(),isNumber(),isUndefined(),isObject()}}
   */
    function () {

    //noinspection JSUnusedAssignment
    var result = {},
      __toString = Object.prototype.toString,
      _undef,
      sourceTypes = [true, 1, [], function () {
      }, _undef, {}],
      classNamePattern = /\s+(\w+)]/,
      fullName,
      originalName; // PhantomJS bug

    for (var i = 0, maxI = sourceTypes.length; i < maxI; i++) {
      fullName = (originalName = __toString.call(sourceTypes[i])).replace('DOMWindow', 'Undefined'); // PhantomJS bug
      result['is' + fullName.match(classNamePattern)[1]] = getTestFor(originalName);
    }

    //noinspection JSValidateTypes
    return result;

    function getTestFor(fullName) {
      return function (val) {
        return __toString.call(val) === fullName;
      };
    }
  })();

  /**
   *
   * @param val
   * @returns {boolean}
   */
  function isExecutable(val) {
    return type.isFunction(val) || (val instanceof CrunchTask);
  }

  /**
   *
   * @throws Error
   * @param errType
   * @param msg
   */
  function error(errType, msg) {
    if (type.isUndefined(msg)) {
      msg = errType;
      errType = 'Generic';
    }
    throw new Error(['`CT_', errType, '`. Message: ', msg].join(''));
  }

  var Promise = ((typeof Promise !== 'undefined') ?
    Promise :
    ((typeof root.Promise !== 'undefined') ?
      root.Promise :
      ((typeof require !== 'undefined') ?
        require("promise-polyfill") :
        false)));

  if (Promise === false) {
    error('Linking', 'Dependency isn\'t met: "promise-polyfill"');
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = root.CrunchTask ? root.CrunchTask : CrunchTask;
  } else if (!root.CrunchTask) {
    root.CrunchTask = CrunchTask;
  }

  var config = {
      timeLimit: 100,
      timeoutAmount: 0,
      debug: false
    }, defaultConfig = {
      timeLimit: 100,
      timeoutAmount: 0,
      debug: false
    },
    staticParentTask = null,
    staticSecurityLock = false,
    staticLastSafeError = null;

  /**
   * @deprecated use range
   * @type {staticFor}
   */
  CrunchTask.for = staticFor;
  CrunchTask.range = staticFor;
  CrunchTask.rangeCheck = normalizeRanges;
  /**
   * @deprecated use range
   * @type {Range}
   */
  CrunchTask.rangeNextAndCheck = function(range, checkOnly) {
    return range.canAdvance(checkOnly);
  };
  CrunchTask.forEach = staticForEach;
  CrunchTask.reduce = staticReduce;

  /**
   *
   * @param {{boolean}|{ timeLimit:Number, timeoutAmount:Number, debug:boolean }} obj
   */
  CrunchTask.config = function(obj) {
    if (!type.isObject(obj)) {
      return CrunchTask.config(defaultConfig);
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
  };

  CrunchTask.config(false);

  var uid = 0;

  /**
   * Generates new id.
   * @returns {number}
   */
  function nextUid() {
    return ++uid;
  }

  var EVENT_NAMES = _initObjectProps({
      run     : null,
      done    : null,
      fail    : null,
      abort   : null,
      error   : null,
      progress: null,
      idle    : null
    }, 'event.'),
    STATE_NAMES = _initObjectProps({
      init    : null,
      error   : null,
      running : null,
      paused  : null,
      resolved: null,
      rejected: null,
      aborted : null
    }, 'state.'),
    SETTLED_STATES = _arrayToObject([
      STATE_NAMES.error,
      STATE_NAMES.resolved,
      STATE_NAMES.rejected,
      STATE_NAMES.aborted
    ], true),
    NEED_REPEAT_STATES = _arrayToObject([
      STATE_NAMES.running,
      STATE_NAMES.paused
    ], true),
    VERBOSE_STATES = _arrayToObject([
      STATE_NAMES.resolved, STATE_NAMES.rejected,
      STATE_NAMES.error, STATE_NAMES.aborted
    ], [
      'success', 'failure',
      'error', 'aborted'
    ]);

  /**
   * For each property assigns a value based on a prefix and the property name
   * @param {object} obj
   * @param {string} prefix
   * @returns {object}
   * @private
   */
  function _initObjectProps(obj, prefix) {
    for (var prop in obj) {
      //noinspection JSUnfilteredForInLoop
      if (__hasOwnProperty.call(obj, prop)) {
        //noinspection JSUnfilteredForInLoop
        obj[prop] = prefix + prop;
      }
    }
    return obj;
  }

  /**
   * Returns an object based on an array, where array's items from the property names, and the value is specified either directly, or corresponds to another array's item
   * @param {[]} arr
   * @param {[]|string|boolean} value
   * @returns {{}}
   * @private
   */
  function _arrayToObject(arr, value) {
    var result = {},
      isArray = type.isArray(value);

    for (var i = 0, iMax = arr.length; i < iMax; i++) {
      result[arr[i]] = isArray ? value[i] : value;
    }

    return result;
  }

  function _objExtend(target, source) {
    for (var prop in source) {
      //noinspection JSUnfilteredForInLoop
      if (__hasOwnProperty.call(source, prop)) {
        //noinspection JSUnfilteredForInLoop
        target[prop] = source[prop];
      }
    }
    return target;
  }

  //noinspection JSCommentMatchesSignature,JSValidateJSDoc
  /**
   * Returns a partially applied function `fn` for optional `args`, with optional context of `ctx`
   * @param {{}} [ctx]
   * @param {function} fn
   * @params {...*} args
   * @returns {function} partially applied function
   * @private
   */
  function _fnPartial(/*{ctx}, fn, args..*/) {
    var ctx = this,
      fn = arguments[0],
      args0 = __slice.call(arguments, 1);

    if ((!type.isFunction(fn)) && (type.isFunction(args0[0]))) {
      ctx = arguments[0];
      fn = args0.shift();
    }

    return function () {
      var args1 = __slice.call(arguments, 0);
      return fn.apply(ctx, [].concat(args0, args1));
    };
  }

  /**
   * Executes the `fn` function in context of `ctx` and returns if result or `ctx` for chainability
   * @param ctx
   * @param fn
   * @params {...*} args
   * @returns {Function}|ctx
   * @private
   */
  function _fnBind(ctx, fn) {
    var args0 = __slice.call(arguments, 2);
    return function () {
      var args1 = __slice.call(arguments, 0);
      return fn.apply(ctx, [].concat(args0, args1)) || ctx;
    };
  }

  /**
   *
   * @params {...function} fns
   * @returns {Function}
   * @private
   */
  function _fnTogether(/* fns */) {
    var auxFns = __slice.call(arguments, 0);
    return function () {
      var args = __slice.call(arguments, 0),
        auxFn, fnsCopy = [].concat(auxFns);
      while ((auxFn = fnsCopy.shift()) && type.isFunction(auxFn)) {
        auxFn.apply(this, args);
      }
    };
  }


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
        handler.apply(this, [].concat(args0, args1));
      } catch (e) {
        if (config.debug) {
          console.log(e + ', stack: ' + e.stack);
        }
      }
    }
  }

  /**
   * Queues execution of this function asynchronously
   * @param {number} timeoutAmount
   * @param {function} fn
   * @param {[]} [args0]
   */
  function defer(timeoutAmount, fn, args0) {
    var ctx = this;

    return setTimeout(function () {
      fn.apply(ctx, args0 || []);
    }, timeoutAmount || 0);
  }

  /**
   *
   * @param {{}} [ctx]
   * @param {function} fn
   * @returns {function}
   */
  function safe(ctx, fn) {
    if (type.isFunction(ctx)) {
      //noinspection JSValidateTypes
      fn = ctx;
      //noinspection JSValidateTypes
      ctx = this;
    }
    if (!type.isFunction(fn)) {
      fn = function () { };
    }
    return function () {
      var args0 = __slice.call(arguments, 0);
      try {
        fn.apply(ctx, args0);
        return true;
      } catch (e) {
        staticLastSafeError = e;
        if (config.debug) {
          console.log(e + ', stack: ' + e.stack);
        }
        return false;
      }
    };
  }

  /**
   *
   * @param descriptionFn
   * @param taskEvents
   * @returns {Promise}
   */
  function protoRun(descriptionFn, taskEvents) {
    var thisTask = this;
    var parentTask = staticParentTask;
    staticParentTask = null;

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

        encapsulation = _fnPartial(runCtx, encapsulateRunInstance,
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

    return _objExtend(promise, {
      onError: _fnPartial(promise, instanceApi.runEventsOn, EVENT_NAMES.error),

      abort : _fnPartial(promise, instanceApi.abort),
      pause : _fnPartial(promise, instanceApi.pause),
      resume: _fnPartial(promise, instanceApi.resume),

      done  : _fnPartial(promise, instanceApi.runEventsOn, EVENT_NAMES.done),
      fail  : _fnPartial(promise, instanceApi.runEventsOn, EVENT_NAMES.fail),
      always: _fnPartial(promise, instanceApi.runEventsOn, [EVENT_NAMES.done, EVENT_NAMES.fail, EVENT_NAMES.error].join()),

      progress  : _fnPartial(promise, instanceApi.runEventsOn, EVENT_NAMES.progress)
    });
  }

  function encapsulateRunInstance(instanceApi, taskEvents, resolveReject, promise) {

    var ctx = this,
      thisTask = ctx.task,
      parentTask = ctx.parentTask,
      resolveSafe = safe(resolveReject.resolve),
      rejectSafe = safe(resolveReject.reject),
      runEvents = serveEvents(promise),
      triggerBoth = _fnTogether(runEvents.trigger, taskEvents.trigger);

    if (parentTask) {
      parentTask.childTask = thisTask;
    }

    return _objExtend(instanceApi, {

      /**
       *
       * @param _initFn
       * @returns {*}
       */
      setupInit: function (_initFn) {
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
      //onError: _fnPartial(runEvents.on, EVENT_NAMES.error),
      //onDone: _fnPartial(runEvents.on, EVENT_NAMES.done),
      //onFail: _fnPartial(runEvents.on, EVENT_NAMES.fail),
      //onAlways: _fnPartial(runEvents.on, [EVENT_NAMES.done,EVENT_NAMES.fail].join()),

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

      sendNotify: _fnPartial(triggerBoth, EVENT_NAMES.progress)

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
        staticSecurityLock = true;
        taskC._signalIdle();
        staticSecurityLock = true;
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
          staticSecurityLock = true;
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

    if (safe(thisTask, descriptionFn)(
        instanceApi.setupInit,
        instanceApi.setupBody,
        instanceApi.setupFin) &&
      (!SETTLED_STATES[ctx.state]) &&
      (ctx.conditionsToMeet === 0)) {

      var _needRepeat = ctx.needRepeat;
      _needRepeat = ((_needRepeat === false) ? _needRepeat
        : ((_needRepeat === 0) ? _needRepeat : _needRepeat || config.timeLimit));

      ctx.needRepeat = (_needRepeat === 0) ? true : _needRepeat;
      ctx.timeoutAmount = ctx.timeoutAmount || config.timeoutAmount;

      instanceApi.goRunning();

      // schedule init, body, fin, etc.
      defer.call(ctx, 0, function () {

        if (this.initFn && !this.initFn.apply(this, this.runArgs)) {
          instanceApi.signalError('CrunchTask.description.init');
        }

        proceedBodyFn.call(this, instanceApi, true);

      });

    } else {
      // bad outcome, reject
      return instanceApi.signalError('CrunchTask.description.else', '');
    }
  }

  function proceedBodyFn(instanceApi, isFirstTime) {
    defer.call(this, isFirstTime ? 0 : this.timeoutAmount, function (instanceApi) {

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

  function serveEvents(ctx, _obj) {
    var obj = _obj || {};
    return {
      on     : _fnBind(ctx, _on, obj),
      trigger: _fnBind(ctx, _trigger, obj)
    };
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
    return _objExtend(task, {
      id       : nextUid(),
      timestamp: new Date() - 0,
      runCount : 0,
      isIdle   : function isIdle() {
        return task.runCount === 0;
      },

      pause : _fnBind(task, protoPause),
      resume: _fnBind(task, protoResume),
      abort : _fnBind(task, protoAbort),

      run : _fnPartial(task, protoRun, descriptionFn, events),
      then: _fnPartial(task, protoThen),

      onRun   : _fnPartial(events.on, EVENT_NAMES.run),
      onIdle  : _fnPartial(events.on, EVENT_NAMES.idle),
      onError : _fnPartial(events.on, EVENT_NAMES.error),
      done    : _fnPartial(events.on, EVENT_NAMES.done),
      fail    : _fnPartial(events.on, EVENT_NAMES.fail),
      always  : _fnPartial(events.on, [EVENT_NAMES.done, EVENT_NAMES.fail, EVENT_NAMES.error].join()),
      progress: _fnPartial(events.on, EVENT_NAMES.progress),
      _signalIdle: function(){
        if (!staticSecurityLock) { return; }
        staticSecurityLock = false;
        events.trigger(EVENT_NAMES.idle);
      }
    });
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
        staticParentTask = ctx;
        return task.run.apply(task, args);
      };
    } else {
      return function (k) {
        return k;
      };
    }
  }

  var Range = (function () {

    function Range(args) {
      if ((arguments.length > 1) || (!type.isArray(args))) {
        error('Ranges', 'Pass strictly a single arguments of type array');
      }
      if (!(this instanceof Range)) {
        return new Range(args);
      }
      this.data = translateRangeArgs(parseRangeArgs(args));
    }

    Range.prototype.toString = Range.prototype.valueOf = function () {
      var result = [];
      for (var i = 0, maxI = this.data.length; i < maxI; i++) {
        result.push(this.data[i].current);
      }
      return result;
    };

    /**
     *
     * @param {boolean} [justCheck]
     * @returns {boolean}
     */
    Range.prototype.canAdvance = function canAdvance(justCheck) {
      var currentR = 0,
        ranges = this.data,
        maxR = ranges.length,
        range,
        counterOverflow,
        rangeInBounds;

      do {
        counterOverflow = false;
        range = ranges[currentR];

        if (justCheck !== true) {
          range.current += range.step;
        }

        if ((!range.inclusive && (range.current === range.to)) || ((range.step > 0) ? (range.current > range.to) : (range.current < range.to))) {
          range.current = range.from;
          counterOverflow = true;
          currentR++;
        }

        rangeInBounds = (currentR < maxR);

      } while (counterOverflow && rangeInBounds);

      return (!counterOverflow && rangeInBounds);
    };

    return Range;

    function translateRangeArgs(args) {
      var result = [];

      for (var i = 0, maxI = args.length; i < maxI; i++) {
        result.push(translateRangeSet(args[i]));
      }

      return result;
    }

    function translateRangeSet(rangeSet) {
      var rangeLength = rangeSet.length,
        last = rangeLength - 1,
        lastIsBool = type.isBoolean(rangeSet[last]),
        step;

      //noinspection FallThroughInSwitchStatementJS
      switch (rangeLength - ((lastIsBool) ? 1 : 0)) {
        case 2: // fallthrough
        case 3: // fallthrough
        {
          step = (((rangeLength - ((lastIsBool) ? 1 : 0)) === 3) ?
            rangeSet[2] : ((rangeSet[0] <= rangeSet[1]) ? 1 : -1));
          return {
            from     : rangeSet[0],
            current  : rangeSet[0],
            to       : rangeSet[1],
            step     : step,
            inclusive: lastIsBool ? rangeSet[rangeLength - 1] : false
          };
        }

        case 0: // fallthrough
        case 1: // fallthrough
          error('Ranges', 'Use at least two values to define a range.');
          break;

        default:
          if (((rangeLength % 2) === 0) && ((rangeLength % 3) === 0)) {
            error('Ranges', 'Use arrays to split range parts. Cannot determine pattern now.');
          } else {
            error('Ranges', 'Use arrays to split range parts properly.');
          }
      }
    }


    function parseRangeArgs(args, preventRecursion) {
      var result = [],
        current = [],
        item,
        isArrayFlag;

      while (args.length) {
        item = args.splice(0, 1)[0];
        isArrayFlag = type.isArray(item);

        if (isArrayFlag && (preventRecursion !== true)) {
          if (current.length) {
            result.push(current);
            current = [];
          }
          result.push(parseRangeArgs(item, true));
        } else if (type.isBoolean(item)) {
          current.push(item);
          result.push(current);
          current = [];
        } else if (type.isNumber(item)) {
          current.push(item);
        }
      }

      if (current.length) {
        result.push(current);
      }

      return (preventRecursion === true) ? result[0] : result;
    }

  })();


})();
