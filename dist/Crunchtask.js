(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define('Crunchtask', ['module'], factory);
  } else if (typeof exports !== "undefined") {
    factory(module);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod);
    global.Crunchtask = mod.exports;
  }
})(this, function (module) {
  'use strict';

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  var _slicedToArray = function () {
    function sliceIterator(arr, i) {
      var _arr = [];
      var _n = true;
      var _d = false;
      var _e = undefined;

      try {
        for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);

          if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"]) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }

      return _arr;
    }

    return function (arr, i) {
      if (Array.isArray(arr)) {
        return arr;
      } else if (Symbol.iterator in Object(arr)) {
        return sliceIterator(arr, i);
      } else {
        throw new TypeError("Invalid attempt to destructure non-iterable instance");
      }
    };
  }();

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var _NEED_REPEAT_STATES, _VERBOSE_STATES, _SETTLED_STATES;

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  var __hasOwnProperty = {}.hasOwnProperty;

  function mirror(obj) {
    var prefix = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

    for (var prop in obj) {
      if (__hasOwnProperty.call(obj, prop)) {
        obj[prop] = prefix + prop;
      }
    }
    return obj;
  }

  var EVENT_NAMES = mirror({
    run: null,
    done: null,
    fail: null,
    abort: null,
    error: null,
    progress: null,
    idle: null
  }, 'event.');

  var STATE_NAMES = mirror({
    init: null,
    error: null,
    running: null,
    paused: null,
    resolved: null,
    rejected: null,
    aborted: null
  }, 'state.');

  var NEED_REPEAT_STATES = (_NEED_REPEAT_STATES = {}, _defineProperty(_NEED_REPEAT_STATES, STATE_NAMES.running, true), _defineProperty(_NEED_REPEAT_STATES, STATE_NAMES.paused, true), _NEED_REPEAT_STATES);

  var VERBOSE_STATES = (_VERBOSE_STATES = {}, _defineProperty(_VERBOSE_STATES, STATE_NAMES.resolved, 'success'), _defineProperty(_VERBOSE_STATES, STATE_NAMES.rejected, 'failure'), _defineProperty(_VERBOSE_STATES, STATE_NAMES.error, 'error'), _defineProperty(_VERBOSE_STATES, STATE_NAMES.aborted, 'aborted'), _VERBOSE_STATES);

  var SETTLED_STATES = (_SETTLED_STATES = {}, _defineProperty(_SETTLED_STATES, STATE_NAMES.error, true), _defineProperty(_SETTLED_STATES, STATE_NAMES.resolved, true), _defineProperty(_SETTLED_STATES, STATE_NAMES.rejected, true), _defineProperty(_SETTLED_STATES, STATE_NAMES.aborted, true), _SETTLED_STATES);

  var uid = 0;

  function nextUid() {
    return ++uid;
  }

  var result = {};
  var fullName = void 0;
  var originalName = void 0;
  var __toString = Object.prototype.toString;
  var _undef = undefined;
  var sourceTypes = [true, 1, [], function () {}, _undef, {}];
  var classNamePattern = /\s+(\w+)]/;
  for (var i = 0, maxI = sourceTypes.length; i < maxI; i++) {
    fullName = (originalName = __toString.call(sourceTypes[i])).replace('DOMWindow', 'Undefined');
    result['is' + fullName.match(classNamePattern)[1]] = getTestFor(originalName);
  }

  function getTestFor(fullName) {
    return function (val) {
      return __toString.call(val) === fullName;
    };
  }

  var __slice = [].slice;

  function partial() {
    var ctx = this,
        fn = arguments[0],
        args0 = __slice.call(arguments, 1);

    if (!result.isFunction(fn) && result.isFunction(args0[0])) {
      ctx = arguments[0];
      fn = args0.shift();
    }

    return function () {
      for (var _len = arguments.length, args1 = Array(_len), _key = 0; _key < _len; _key++) {
        args1[_key] = arguments[_key];
      }

      return fn.apply(ctx, [].concat(args0, args1));
    };
  }

  var globals = {
    staticLastSafeError: null,
    staticParentTask: null,
    staticSecurityLock: null
  };

  function defer(timeoutAmount, fn, args0) {
    var ctx = this;

    return setTimeout(function () {
      fn.apply(ctx, args0 || []);
    }, timeoutAmount || 0);
  }

  function getExecutableFor(task, ctx) {
    if (result.isFunction(task)) {
      return function (args) {
        return task.apply(ctx || this, args);
      };
    } else if (dynamic.isBuddy(task)) {
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

  function isExecutable(val) {
    return result.isFunction(val) || result.isBuddy(val);
  }

  var defaultConfig = {
    trace: false,
    timeLimit: 100,
    timeoutAmount: 0,
    debug: false
  };

  var config = {
    trace: false,
    timeLimit: 100,
    timeoutAmount: 0,
    debug: false
  };

  function _on(hive, evt, fn) {
    if (!fn && !result.isFunction(fn)) {
      return;
    }

    var evts = evt.split(/\s*,\s*/),
        evtName = void 0,
        handlers = void 0;

    for (var _len2 = arguments.length, args = Array(_len2 > 3 ? _len2 - 3 : 0), _key2 = 3; _key2 < _len2; _key2++) {
      args[_key2 - 3] = arguments[_key2];
    }

    while (evtName = evts.shift()) {
      if (handlers = hive[evtName]) {
        handlers.push([fn, args]);
      } else {
        hive[evtName] = [[fn, args]];
      }
    }
  }

  function _trigger(hive, evt) {
    if (!hive[evt]) {
      return;
    }
    var handlers = hive[evt];

    for (var _len3 = arguments.length, args1 = Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
      args1[_key3 - 2] = arguments[_key3];
    }

    for (var handler, args0, _i = 0, _maxI = handlers.length; _i < _maxI; _i++) {
      handler = handlers[_i][0];
      args0 = handlers[_i][1];
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

  function serveEvents(ctx) {
    var obj = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return {
      on: _on.bind(ctx, obj),
      trigger: _trigger.bind(ctx, obj)
    };
  }

  var __slice$1 = [].slice;

  function safe(ctx, fn) {
    if (result.isFunction(ctx)) {
      fn = ctx;

      ctx = this;
    }
    if (!result.isFunction(fn)) {
      fn = function fn() {};
    }
    return function () {
      var args0 = __slice$1.call(arguments, 0);
      try {
        fn.apply(ctx, args0);
        return true;
      } catch (e) {
        globals.staticLastSafeError = e;
        if (config.debug) {
          console.log(e + ', stack: ' + e.stack);
        }
        return false;
      }
    };
  }

  var __slice$2 = [].slice;

  function together() {
    var auxFns = __slice$2.call(arguments, 0);

    return function () {
      var args = __slice$2.call(arguments, 0),
          auxFn,
          fnsCopy = [].concat(auxFns);

      while ((auxFn = fnsCopy.shift()) && result.isFunction(auxFn)) {
        auxFn.apply(this, args);
      }
    };
  }

  var makeRunInstanceApi = function makeRunInstanceApi(ctx, taskEvents, promise, promiseControl) {
    var thisTask = ctx.task;
    var parentTask = ctx.parentTask;
    var resolveSafe = safe(promiseControl.resolve);
    var rejectSafe = safe(promiseControl.reject);
    var runEvents = serveEvents(promise);
    var triggerBoth = together(runEvents.trigger, taskEvents.trigger);

    if (parentTask) {
      parentTask.childTask = thisTask;
    }

    return {
      setupInit: function setupInit(_initFn) {
        if (config.trace) {
          console.log('setupInit', new Date() - 0);
        }
        if (SETTLED_STATES[ctx.state]) {
          return;
        }
        if (!result.isUndefined(_initFn) && !result.isFunction(_initFn)) {
          return signalError('Crunchtask.description.initSetup', 'Init setup expects an optional parameter of type function only.');
        }
        ctx.initFn = safe(thisTask, _initFn);
      },
      setupBody: function setupBody(_bodyFn, _needRepeat, _timeout) {
        if (config.trace) {
          console.log('setupBody', new Date() - 0);
        }
        if (SETTLED_STATES[ctx.state]) {
          return;
        }

        if (!result.isFunction(_bodyFn)) {
          return signalError('CrunchTask.description.bodySetup', 'Body setup expects a function as the first optional arg.');
        }

        if (!result.isUndefined(_needRepeat) && !result.isBoolean(_needRepeat) && !result.isNumber(_needRepeat)) {
          return signalError('CrunchTask.description.bodySetup', 'Body setup expects a number or false as the second optional arg.');
        }

        if (!result.isUndefined(_timeout) && !result.isNumber(_timeout)) {
          return signalError('CrunchTask.description.bodySetup', 'Body setup expects a number as the 3rd optional arg.');
        }

        ctx.bodyFn = safe(thisTask, _bodyFn);
        ctx.conditionsToMeet--;

        ctx.needRepeat = _needRepeat;
        ctx.timeoutAmount = _timeout;
      },
      setupFin: function setupFin(_finallyFn) {
        if (config.trace) {
          console.log('setupFin', new Date() - 0);
        }
        if (SETTLED_STATES[ctx.state]) {
          return;
        }
        if (!result.isUndefined(_finallyFn) && !result.isFunction(_finallyFn)) {
          return signalError('CrunchTask.description.finSetup', 'Fin setup expects a function as a first optional arg.');
        }
        ctx.finallyFn = safe(thisTask, _finallyFn);
      },

      runEventsOn: runEvents.on,
      signalError: signalError,
      goRunning: function goRunning() {
        thisTask.runCount++;
        ctx.state = STATE_NAMES.running;
        taskEvents.trigger(EVENT_NAMES.run, ctx.id);
      },
      resolve: function resolve() {
        if (SETTLED_STATES[ctx.state]) {
          return;
        }
        ctx.state = STATE_NAMES.resolved;

        for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
          args[_key4] = arguments[_key4];
        }

        ctx.value = args;

        decreaseRunning(thisTask);

        signalGeneric(args, EVENT_NAMES.done, resolveSafe);
      },
      reject: function reject() {
        if (SETTLED_STATES[ctx.state]) {
          return;
        }
        ctx.state = STATE_NAMES.rejected;

        for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
          args[_key5] = arguments[_key5];
        }

        ctx.value = args;

        decreaseRunning(thisTask);

        signalGeneric(args, EVENT_NAMES.fail, rejectSafe);
      },
      abort: function abort() {
        if (SETTLED_STATES[ctx.state]) {
          return;
        }
        ctx.state = STATE_NAMES.aborted;
        return this;
      },
      pause: function pause() {
        if (SETTLED_STATES[ctx.state]) {
          return;
        }
        ctx.state = STATE_NAMES.paused;
        return this;
      },
      resume: function resume() {
        if (SETTLED_STATES[ctx.state]) {
          return;
        }
        ctx.state = STATE_NAMES.running;
        return this;
      },

      sendNotify: partial(triggerBoth, EVENT_NAMES.progress)
    };

    function signalError() {
      if (SETTLED_STATES[ctx.state]) {
        return;
      }

      ctx.state = STATE_NAMES.error;

      for (var _len6 = arguments.length, args = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
        args[_key6] = arguments[_key6];
      }

      ctx.value = args;

      signalGeneric(args, EVENT_NAMES.error, rejectSafe);
    }
    function signalGeneric(args0, eventName, actionFn) {
      triggerBoth.apply(this, [eventName].concat(args0));

      if (actionFn) {
        defer.call(thisTask, 0, actionFn, [args0]);
      }
    }

    function signalTwoParties(taskC, taskP) {
      defer(1, function () {
        if (taskC.runCount + taskP.runCount > 0) {
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
        defer(1, function () {
          if (thisTask.runCount) {
            return;
          }
          globals.staticSecurityLock = true;
          thisTask._signalIdle();
        });
      }
    }
  };

  function processBodyFn(instanceApi, isFirstTime) {
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
          timeLimit = result.isNumber(needRepeat) ? needRepeat : 0;

      var timerBatchStart,
          timerStart,
          miniRunCount = 0,
          timerElapsed = 0;

      var canExecuteNextLoop = this.state === STATE_NAMES.running && !task.isPaused && !task.isAborted,
          canRepeatThisLoop,
          canQueueNextBatch;

      if (canExecuteNextLoop) {
        timerBatchStart = new Date();
        do {

          try {
            timerStart = new Date();
            this.bodyFn(instanceApi.resolve, instanceApi.reject, instanceApi.sendNotify, {
              batchStarted: timerBatchStart,
              batchIndex: miniRunCount,
              batchElapsed: timerElapsed,
              runBlock: this.runBlock
            });
          } catch (ex) {
            if (config.debug) {
              console.log(ex + ', stack: ' + ex.stack);
            }
            instanceApi.signalError('body', ex);
          }

          timerElapsed += new Date() - timerStart;
          miniRunCount++;

          canRepeatThisLoop = needRepeat && timeLimit !== 0 && timerElapsed < timeLimit && this.state === STATE_NAMES.running;
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
        return processBodyFn.call(this, instanceApi);
      }

      if (needRepeat === false) {
        instanceApi.resolve();
      }

      if (this.finallyFn && !this.finallyFn.call(this, VERBOSE_STATES[this.state])) {
        instanceApi.signalError('CrunchTask.description.fin', this.status);
      }
    }, [instanceApi]);
  }

  function processDescriptionFn(instanceApi) {
    var ctx = this,
        thisTask = ctx.task,
        descriptionFn = ctx.descriptionFn;

    if (!descriptionFn) {
      return instanceApi.signalError('CrunchTask.description.empty', 'Description function is empty. Ctx:' + JSON.stringify(ctx));
    }

    if (config.trace) {
      console.log('before descriptionFn run', new Date() - 0);
    }

    if (safe(thisTask, descriptionFn)(instanceApi.setupInit, instanceApi.setupBody, instanceApi.setupFin) && !SETTLED_STATES[ctx.state] && ctx.conditionsToMeet === 0) {

      if (config.trace) {
        console.log('after descriptionFn run', new Date() - 0);
      }

      var _needRepeat = ctx.needRepeat;
      _needRepeat = _needRepeat === false ? _needRepeat : _needRepeat === 0 ? _needRepeat : _needRepeat || config.timeLimit;

      ctx.needRepeat = _needRepeat === 0 ? true : _needRepeat;
      ctx.timeoutAmount = ctx.timeoutAmount || config.timeoutAmount;

      if (config.trace) {
        console.log('collected `needRepeat`:', ctx.needRepeat);
        console.log('collected `timeoutAmount`:', ctx.timeoutAmount);
      }

      instanceApi.goRunning();

      if (config.trace) {
        console.log('before deferred Init + Body scheduler', new Date() - 0);
      }

      defer.call(ctx, 0, function () {

        if (config.trace) {
          console.log('inside deferred Init + Body scheduler. With args:', new Date() - 0, this.runArgs.join());
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
      return instanceApi.signalError('CrunchTask.description.else', '');
    }
  }

  function error(errType, msg) {
    if (result.isUndefined(msg)) {
      msg = errType;
      errType = 'Generic';
    }
    throw new Error(['`CT_', errType, '`. Message: ', msg].join(''));
  }

  var Range = function () {
    function Range() {
      _classCallCheck(this, Range);

      for (var _len7 = arguments.length, args = Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
        args[_key7] = arguments[_key7];
      }

      if (args.length > 1 || !result.isArray(args[0])) {
        error('Ranges', 'Pass strictly a single arguments of type array');
      }
      var data = args[0];

      this.data = translateRangeArgs(parseRangeArgs(data));
    }

    _createClass(Range, [{
      key: 'toString',
      value: function toString() {
        return verbose.apply(this);
      }
    }, {
      key: 'valueOf',
      value: function valueOf() {
        return verbose.apply(this);
      }
    }, {
      key: 'canAdvance',
      value: function canAdvance(justCheck) {
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

          if (!range.inclusive && range.current === range.to || (range.step > 0 ? range.current > range.to : range.current < range.to)) {
            range.current = range.from;
            counterOverflow = true;
            currentR++;
          }

          rangeInBounds = currentR < maxR;
        } while (counterOverflow && rangeInBounds);

        return !counterOverflow && rangeInBounds;
      }
    }]);

    return Range;
  }();

  function map(arr, fn) {
    var result = new Array(arr.length);
    for (var _i2 = 0, _maxI2 = arr.length; _i2 < _maxI2; _i2++) {
      result[_i2] = fn(arr[_i2], _i2);
    }
    return result;
  }

  function verbose() {
    return map(this.data, function (v) {
      return v.current;
    });
  }

  function translateRangeArgs(args) {
    return map(args, translateRangeSet);
  }

  function translateRangeSet(rangeSet) {
    var rangeLength = rangeSet.length,
        last = rangeLength - 1,
        lastIsBool = result.isBoolean(rangeSet[last]);

    var step = void 0;

    switch (rangeLength - (lastIsBool ? 1 : 0)) {
      case 2:
      case 3:
        {
          step = rangeLength - (lastIsBool ? 1 : 0) === 3 ? rangeSet[2] : rangeSet[0] <= rangeSet[1] ? 1 : -1;
          return {
            from: rangeSet[0],
            current: rangeSet[0],
            to: rangeSet[1],
            step: step,
            inclusive: lastIsBool ? rangeSet[rangeLength - 1] : false
          };
        }

      case 0:
      case 1:
        error('Ranges', 'Use at least two values to define a range.');
        break;

      default:
        if (rangeLength % 2 === 0 && rangeLength % 3 === 0) {
          error('Ranges', 'Use arrays to split range parts. Cannot determine pattern now.');
        } else {
          error('Ranges', 'Use arrays to split range parts properly.');
        }
    }
  }

  function parseRangeArgs(args, preventRecursion) {
    var result$$ = [];

    var current = [],
        item = void 0,
        isArrayFlag = void 0;

    while (args.length) {
      item = args.splice(0, 1)[0];
      isArrayFlag = result.isArray(item);

      if (isArrayFlag && preventRecursion !== true) {
        if (current.length) {
          result$$.push(current);
          current = [];
        }
        result$$.push(parseRangeArgs(item, true));
      } else if (result.isBoolean(item)) {
        current.push(item);
        result$$.push(current);
        current = [];
      } else if (result.isNumber(item)) {
        current.push(item);
      }
    }

    if (current.length) {
      result$$.push(current);
    }

    return preventRecursion === true ? result$$[0] : result$$;
  }

  var resolvedTask = function resolvedTask() {
    var TaskType = result.getTaskType();
    return new TaskType(function (init, body) {
      return body(function (resolve) {
        return resolve();
      });
    });
  };

  function staticFor() {
    for (var _len8 = arguments.length, n_args = Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
      n_args[_key8] = arguments[_key8];
    }

    var argsCount = n_args.length;
    var fnCount = 0;

    while (isExecutable(n_args[argsCount - 1 - fnCount])) {
      fnCount++;
    }

    var args = n_args.slice(0, argsCount - fnCount);
    var ranges = new Range(args);

    var fns = n_args.slice(-fnCount);

    var _fns = _slicedToArray(fns, 2);

    var taskBody = _fns[0];
    var _fns$ = _fns[1];
    var taskTail = _fns$ === undefined ? function () {} : _fns$;


    if (!taskBody) {
      return resolvedTask();
    }

    return internalFor(ranges, taskBody, taskTail);
  }

  function internalFor(_ranges, taskBody, taskTail) {

    var TaskType = result.getTaskType();

    return new TaskType(function (init, body, fin) {

      var bodyFn = getExecutableFor(taskBody, this),
          tailFn = getExecutableFor(taskTail, this);

      var ranges = _ranges;
      var canRunCycle = void 0;

      init(function () {
        for (var _len9 = arguments.length, args = Array(_len9), _key9 = 0; _key9 < _len9; _key9++) {
          args[_key9] = arguments[_key9];
        }

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

  function staticForEach(arr, taskBody, taskTail) {

    var TaskType = result.getTaskType();

    return new TaskType(function (init, body, fin) {

      var bodyFn = getExecutableFor(taskBody, this),
          tailFn = getExecutableFor(taskTail, this);

      var ranges = void 0,
          ptr = void 0,
          arrInternal = arr,
          canRunCycle = void 0;

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
  };

  function normalizeRanges() {
    for (var _len10 = arguments.length, args = Array(_len10), _key10 = 0; _key10 < _len10; _key10++) {
      args[_key10] = arguments[_key10];
    }

    return new Range(args);
  };

  function staticReduce(arr, memo, taskBody, taskTail) {

    var TaskType = result.getTaskType();

    return new TaskType(function (init, body, fin) {

      var bodyFn = getExecutableFor(taskBody, this),
          tailFn = getExecutableFor(taskTail, this);

      var ranges = void 0,
          ptr = void 0,
          arrInternal = arr,
          memoInternal = memo,
          canRunCycle = void 0;

      init(function (_arr, _memo) {
        if (_arr) {
          arrInternal = arr;
        }

        ranges = new Range([0, arrInternal.length]);
        canRunCycle = ranges.canAdvance(true);

        if (!result.isUndefined(_memo)) {
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

  var CrunchInstancePromise = function CrunchInstancePromise(fn) {
    _classCallCheck(this, CrunchInstancePromise);

    return new Promise(fn);
  };

  var CrunchInstance = function (_CrunchInstancePromis) {
    _inherits(CrunchInstance, _CrunchInstancePromis);

    function CrunchInstance(thisTask, descriptionFn, taskEvents, args) {
      _classCallCheck(this, CrunchInstance);

      var promiseControl = null;

      var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(CrunchInstance).call(this, function (resolve, reject) {
        promiseControl = {
          resolve: resolve,
          reject: reject
        };
      }));

      var parentTask = globals.staticParentTask;
      globals.staticParentTask = null;

      var runCtx = {
        task: thisTask,
        parentTask: parentTask,
        id: 'T_' + thisTask.id + ':' + nextUid(),
        conditionsToMeet: 1,
        state: STATE_NAMES.init,
        runBlock: 0,
        runArgs: args,
        descriptionFn: descriptionFn
      };

      var instanceApi = makeRunInstanceApi(runCtx, taskEvents, _this2, promiseControl);

      Object.assign(_this2, {
        onError: partial(_this2, instanceApi.runEventsOn, EVENT_NAMES.error),

        abort: partial(_this2, instanceApi.abort),
        pause: partial(_this2, instanceApi.pause),
        resume: partial(_this2, instanceApi.resume),

        done: partial(_this2, instanceApi.runEventsOn, EVENT_NAMES.done),
        fail: partial(_this2, instanceApi.runEventsOn, EVENT_NAMES.fail),
        always: partial(_this2, instanceApi.runEventsOn, [EVENT_NAMES.done, EVENT_NAMES.fail, EVENT_NAMES.error].join()),

        progress: partial(_this2, instanceApi.runEventsOn, EVENT_NAMES.progress)

      });

      defer.call(runCtx, 0, processDescriptionFn, [instanceApi]);
      return _this2;
    }

    return CrunchInstance;
  }(CrunchInstancePromise);

  var CrunchExec = function CrunchExec(ctx, descriptionFn) {
    _classCallCheck(this, CrunchExec);

    var result = void 0,
        events = void 0;
    try {
      return result = function result() {
        for (var _len11 = arguments.length, args = Array(_len11), _key11 = 0; _key11 < _len11; _key11++) {
          args[_key11] = arguments[_key11];
        }

        return new CrunchInstance(ctx, descriptionFn, events, args);
      };
    } finally {
      ctx.events = events = serveEvents(result);
    }
  };

  var Crunchtask = function (_CrunchExec) {
    _inherits(Crunchtask, _CrunchExec);

    function Crunchtask(descriptionFn) {
      _classCallCheck(this, Crunchtask);

      var ctx = {
        id: nextUid(),
        timestamp: new Date() - 0,
        runCount: 0
      };

      var _this3 = _possibleConstructorReturn(this, Object.getPrototypeOf(Crunchtask).call(this, ctx, descriptionFn));

      var _this = _this3;

      var then = function then() {
        for (var _len12 = arguments.length, tasks = Array(_len12), _key12 = 0; _key12 < _len12; _key12++) {
          tasks[_key12] = arguments[_key12];
        }

        var doneHandler = function doneHandler() {
          for (var _len13 = arguments.length, args = Array(_len13), _key13 = 0; _key13 < _len13; _key13++) {
            args[_key13] = arguments[_key13];
          }

          var task = void 0;
          while (task = (tasks || []).shift()) {
            getExecutableFor(task)(args);
          }
        };
        var newTask = void 0;
        try {
          newTask = new Crunchtask(descriptionFn);
        } finally {
          newTask.done(doneHandler);
          _this.done(doneHandler);
        }
      };

      var stack = null;
      if (config.debug) {
        try {
          throw new Error();
        } catch (ex) {
          stack = ex.stack;
        }
      }

      var events = ctx.events;
      delete ctx.events;

      Object.assign(_this3, {

        then: then,
        onRun: partial(events.on, EVENT_NAMES.run),
        onIdle: partial(events.on, EVENT_NAMES.idle),
        onError: partial(events.on, EVENT_NAMES.error),
        done: partial(events.on, EVENT_NAMES.done),
        fail: partial(events.on, EVENT_NAMES.fail),
        always: partial(events.on, [EVENT_NAMES.done, EVENT_NAMES.fail, EVENT_NAMES.error].join()),
        progress: partial(events.on, EVENT_NAMES.progress),
        isIdle: function isIdle() {
          return ctx.runCount === 0;
        },
        pause: function pause() {
          ctx.isPaused = true;
          return _this;
        },
        resume: function resume() {
          delete ctx.isPaused;
          return _this;
        },
        abort: function abort() {
          ctx.isAborted = true;
          return _this;
        }
      });

      Object.assign(ctx, {
        stack: stack,
        _signalIdle: function _signalIdle() {
          if (!globals.staticSecurityLock) {
            return;
          }
          globals.staticSecurityLock = false;
          events.trigger(EVENT_NAMES.idle);
        }
      });
      return _this3;
    }

    return Crunchtask;
  }(CrunchExec);

  Object.assign(Crunchtask, {
    'for': staticFor,
    range: staticFor,
    rangeCheck: normalizeRanges,

    rangeNextAndCheck: function rangeNextAndCheck(range, checkOnly) {
      return range.canAdvance(checkOnly);
    },


    forEach: staticForEach,
    reduce: staticReduce,

    config: function _config(obj) {
      if (!result.isObject(obj)) {
        return _config(defaultConfig);
      }

      var result$$ = {};
      var __hasOwnProperty = {}.hasOwnProperty;

      for (var prop in obj) {
        if (__hasOwnProperty.call(obj, prop) && __hasOwnProperty.call(config, prop)) {
          config[prop] = obj[prop];

          result$$[prop] = obj[prop];
        }
      }

      return result$$;
    }
  });

  Object.assign(result, {
    isBuddy: function isBuddy(input) {
      return input instanceof Crunchtask;
    },
    getTaskType: function getTaskType() {
      return Crunchtask;
    }
  });

  module.exports = Crunchtask;
});