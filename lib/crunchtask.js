/**
 * Created by ANDREW on 10/10/2014.
 * @requires 'bower_components/promise-polyfill'
 */
(function (){

  var root = typeof window === 'object' && window ? window : global,
      __slice = [].slice,
      __hasOwnProperty = {}.hasOwnProperty;

  var type = (/**
   *
   * @returns {{isFunction(),isArray(),isBoolean(),isNumber(),isUndefined()}}
   */
      function(){

    var result = {},
        __toString = Object.prototype.toString,
        undef,
        sourceTypes = [true, 1, [], function(){}, undef],
        classNamePattern = /\s+(\w+)]/,
        fullName;

    for (var i = 0, maxI = sourceTypes.length; i < maxI; i++) {
      fullName = __toString.call(sourceTypes[i]);
      result['is' + fullName.match(classNamePattern)[1]] = (function(fullName){
        return function(val) {
          return __toString.call(val) === fullName;
        };
      })(fullName);
    }

    return result;
  })();

  function isExecutable(val) {
    return type.isFunction(val) || (val instanceof CrunchTask);
  }

  function error(errType, msg){
    if (type.isUndefined(msg)){
      msg = errType;
      errType = 'Generic';
    }
    throw new Error(['`CT_', errType, '`. Message: ', msg].join(''));
  }

  var Promise = (typeof Promise !== 'undefined') ? Promise : ((typeof root.Promise !== 'undefined') ? root.Promise : ((typeof require !== 'undefined') ? require("promise-polyfill") : false));

  if (Promise === false) {
    error('Linking', 'Dependency isn\'t met: "promise-polyfill"');
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = root.CrunchTask ? root.CrunchTask : CrunchTask;
  } else if (!root.CrunchTask) {
    root.CrunchTask = CrunchTask;
  }

  /**
   * @deprecated
   * @type {staticFor}
   */
  CrunchTask.for = staticFor;
  CrunchTask.range = staticFor;
  CrunchTask.rangeCheck = normalizeRanges;
  CrunchTask.rangeNextAndCheck = canAdvance;

  var uid = 0;
  function nextUid(){
    return ++uid;
  }

  var EVENT_NAMES = {
    run: 'event.run',
    done: 'event.done',
    fail: 'event.fail',
    progress: 'event.progress',
    idle: 'event.idle'
  };

  function _objExtend(target, source) {
    for(var prop in source) {
      if (__hasOwnProperty.call(source, prop)) {
        target[prop] = source[prop];
      }
    }
    return target;
  }

  /**
   * Returns a partially applied function `fn` for optional `args`, with optional context of `ctx`
   * @returns {Function} partially applied function
   * @private
   */
  function _fnPartial(/*{ctx}, fn, args..*/){
    var ctx = this,
        fn = arguments[0],
        args0 = __slice.call(arguments, 1);

    if ((!type.isFunction(fn)) && (type.isFunction(args0[0]))) {
      ctx = arguments[0];
      fn = args0.shift();
    }

    return function(){
      var args1 = __slice.call(arguments, 0);
      return fn.apply(ctx, [].concat(args0, args1));
    };
  }

  /**
   * Executes the `fn` function in context of `ctx` and returns if result or `ctx` for chainability
   * @param ctx
   * @param fn
   * @returns {Function}|ctx
   * @private
   */
  function _fnBind(ctx, fn) {
    var args0 = __slice.call(arguments, 2);
    return function(){
      var args1 = __slice.call(arguments, 0);
      return fn.apply(ctx, [].concat(args0, args1)) || ctx;
    };
  }

  /**
   * Passes the arguments list as an array. Main recipient is `Promise.resolve|reject`
   * @param fn
   * @returns {Function}
   * @private
   */
  function _fnWrapArgsFor(fn /*, auxFns...*/) {
    var auxFns = __slice.call(arguments, 1);
    return function(){
      var args = __slice.call(arguments, 0),
          auxFn;
      while ((auxFn = auxFns.shift()) && type.isFunction(auxFn)) {
        auxFn.apply(this, args);
      }
      return fn.call(this, args);
    };
  }


  /**
   * Subscribes a handler `fn(args..)` to a comma-separated event list. Events are scoped by the object `hive`
   * @param hive
   * @param evt
   * @param fn*
   * @private
   */
  function _on(hive, evt, fn){
    if (!fn) { return; }
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
   * @private
   */
  function _trigger(hive, evt /*, args*/){
    var args1 = __slice.call(arguments, 2);
    if ((args1.length === 1) && (type.isArray(args1[0]))) {
      // unwrap
      args1 = args1[0];
    }
    if (!hive[evt]) { return; }
    var handlers = hive[evt];
    for(var pair, handler, args0, i = 0, maxI = handlers.length; i < maxI; i++){
      pair = handlers[i];
      handler = pair[0];
      args0 = pair[1];
      if (!handler) { continue; }
      try {
        handler.apply(this, [].concat(args0, args1));
      } catch (e){
        console.info(e);
      }
    }
  }

  /**
   * Queues execution of this function asynchronously
   * @param timeoutAmount
   * @param fn
   * @param args0
   */
  function defer(timeoutAmount, fn, args0) {
    var ctx = this;
    setTimeout(function(){
      fn.apply(ctx, args0);
    }, timeoutAmount || 0);
  }

  /**
   *
   * @param descriptionFn
   * @param events
   * @returns {Promise}
   */
  function protoRun(descriptionFn, events){
    var thisTask = this,
        args = __slice.call(arguments, 2);

    delete this.isPaused;
    delete this.isAborted;

    this.runCount++;

    events.trigger(EVENT_NAMES.run);

    var result,
        runState = (function(thisTask){
          var ctx = {
            isSettled: null
          }, isSettledStates = {
            'null': false,
            'true': true,
            'false': true,
            'paused': false,
            'aborted': true
          };
          return {
            updateSettledTrue: function(){
              if (isSettledStates[ctx.isSettled]) {
                return;
              }
              ctx.isSettled = true;
              thisTask.runCount--;
            },
            updateSettledFalse: function(){
              if (isSettledStates[ctx.isSettled]) {
                return;
              }
              ctx.isSettled = false;
              thisTask.runCount--;
            },
            updateSettledVal: function(val){
              if (isSettledStates[ctx.isSettled]) {
                return;
              }
              ctx.isSettled = val;
              if (isSettledStates[val]) {
                thisTask.runCount--;
              }
            },
            status: function(){
              return ctx.isSettled;
            }
          };
        })(thisTask);

    try {
      return (result = new Promise(function(_resolve, _reject){

        var initFn, bodyFn, finallyFn,
            needRepeat, timeoutAmount;

        if (descriptionFn) {
          descriptionFn(function (_initFn) {
            initFn = _initFn;
          }, function (_bodyFn, _needRepeat, _timeout) {
            bodyFn = _bodyFn;
            needRepeat = _needRepeat;
            timeoutAmount = _timeout;
          }, function (_finallyFn) {
            finallyFn = _finallyFn;
          });

          defer.call(thisTask, 0, function () {
            if (initFn) {
              initFn.apply(thisTask, args);
            }

            proceedBody.call(thisTask,
                bodyFn,
                ((needRepeat !== false) ? (needRepeat || 0) : needRepeat),
                timeoutAmount,
                finallyFn,
                {
                  resolve: _fnWrapArgsFor(_resolve, runState.updateSettledTrue),
                  reject: _fnWrapArgsFor(_reject, runState.updateSettledFalse),
                  notify: _fnPartial(events.trigger, EVENT_NAMES.progress),
                  status: runState.status
                }
            );
          });
        } else {
          _fnWrapArgsFor(_reject, runState.updateSettledFalse)('empty.description');
        }
      }));
    } finally {

      result.abort = _fnPartial(runState.updateSettledVal, 'aborted');
      result.pause = _fnPartial(runState.updateSettledVal, 'paused');
      result.resume = _fnPartial(runState.updateSettledVal, null);

      result.then(
          _fnPartial(events.trigger, EVENT_NAMES.done),
          _fnPartial(events.trigger, EVENT_NAMES.fail)
      );

      result.then(function(){
        if (thisTask.isIdle()) {
          events.trigger(EVENT_NAMES.idle);
        }
      }, function(){
        if (thisTask.isIdle()) {
          events.trigger(EVENT_NAMES.idle);
        }
      });
    }
  }


  function proceedBody(bodyFn, needRepeat, timeoutAmount, finallyFn, controlNexus) {
    var resolve = controlNexus.resolve,
        reject = controlNexus.reject,
        notify = controlNexus.notify,
        timeLimit = type.isNumber(needRepeat) ? needRepeat : 0;

    var _needRepeat = (needRepeat === 0) ? true : needRepeat;

    defer.call(this, timeoutAmount || 0, function(){
      var timerBatchStart, timerStart, miniRunCount = 0, timerElapsed = 0;

      var canExecuteNextLoop = ((controlNexus.status() === null) && !this.isPaused && !this.isAborted),
          canRepeatThisLoop,
          canQueueNextBatch;

      if (canExecuteNextLoop) {
        timerBatchStart = new Date();
        do {
          try {
            timerStart = new Date();
            bodyFn(resolve, reject, notify, {
              batchStarted: timerBatchStart,
              batchIndex: miniRunCount,
              batchElapsed: timerElapsed
            });
          } catch (ex){
            reject(ex);
          }

          timerElapsed += (new Date() - timerStart);
          miniRunCount++;

          canRepeatThisLoop = ((!!_needRepeat) &&
          (timerElapsed < timeLimit) &&
          (controlNexus.status() === null));
        } while (canRepeatThisLoop);
      } else if (this.isAborted || (controlNexus.status() === 'aborted')) {
        reject('aborted');
      }

      var _status = controlNexus.status();
      canQueueNextBatch = ((!!_needRepeat) &&
      ((_status === null) || (_status === 'paused')) &&
      !this.isAborted);

      if (canQueueNextBatch) {
        return proceedBody.call(this,
            bodyFn, needRepeat, timeoutAmount,
            finallyFn,
            controlNexus);
      }

      try {
        if (finallyFn) {
          finallyFn.call(this, _status);
        }
      } catch (ex) {}
    });
  }

  function protoAbort(){
    this.isAborted = true;
    return this;
  }

  function protoPause(){
    this.isPaused = true;
    return this;
  }
  function protoResume(){
    delete this.isPaused;
    return this;
  }

  function protoThen(descriptionFn /*, tasks..*/){
    var args0 = __slice.call(arguments, 1), _newTask;
    try {
      return (_newTask = new CrunchTask(descriptionFn));
    } finally {
      _newTask.done(function () {
        var args1 = __slice.call(arguments, 0), task;
        while ((task = args0.shift())) {
          if (!(task instanceof CrunchTask)) { continue; }
          task.run.apply(task, args1);
        }
      });
    }
  }

  function serveEvents(ctx, obj){
    return {
      on: _fnBind(ctx, _on, obj),
      trigger: _fnBind(ctx, _trigger, obj)
    };
  }

  function CrunchTask(descriptionFn){
    // always dealing with the `new` keyword instantiation
    if (!(this instanceof CrunchTask)) {
      return new CrunchTask(descriptionFn);
    }
    if (!type.isFunction(descriptionFn)) {
      error('CrunchTask.ctor', 'Single argument is required: `fn(initFn,bodyFn,finFn)`');
    }

    this.id = nextUid();
    this.timestamp = new Date() - 0;
    this.runCount = 0;
    this.isIdle = function(){
      return this.runCount === 0;
    };

    var events = serveEvents(this, {});

    _objExtend(this, {
      pause: _fnBind(this, protoPause),
      resume: _fnBind(this, protoResume),
      abort: _fnBind(this, protoAbort),

      run: _fnPartial(this, protoRun, descriptionFn, events),
      then: _fnPartial(this, protoThen, descriptionFn),

      onRun: _fnPartial(events.on, EVENT_NAMES.run),
      onIdle: _fnPartial(events.on, EVENT_NAMES.idle),
      done: _fnPartial(events.on, EVENT_NAMES.done),
      fail: _fnPartial(events.on, EVENT_NAMES.fail),
      always: _fnPartial(events.on, [EVENT_NAMES.done,EVENT_NAMES.fail].join()),
      progress: _fnPartial(events.on, EVENT_NAMES.progress)
    });
  }

  function staticFor (/*{start, finish, increment, inclusive, } * n, fnBody, {fnTail}*/){
    var argsCount = arguments.length,
        fnCount = 0;

    while ( isExecutable(arguments[argsCount - 1 - fnCount])) {
      fnCount++;
    }

    var args = __slice.call(arguments, 0, argsCount - fnCount),
        fns = __slice.call(arguments, - fnCount),
        ranges = translateRangeArgs(parseRangeArgs(args)),
        taskBody = fns[0],
        taskTail = fns[1] || function(){};

    if (!taskBody) {
      return _resolvedTask();
    }

    return _internalFor(ranges, taskBody, taskTail);
  }

  function normalizeRanges(){
    var args = __slice.call(arguments, 0);
    return translateRangeArgs(parseRangeArgs(args));
  }

  function _internalFor(_ranges,  taskBody, taskTail){
    return new CrunchTask(function(init, body, fin){
      var ranges = _ranges, canRunCycle;

      init(function(){
        var args = __slice.call(arguments, 0);
        if (args.length) {
          ranges = translateRangeArgs(parseRangeArgs(args));
        }
        canRunCycle = canAdvance(ranges, true);
      });

      body(function(resolve){
        if (canRunCycle) {
          callExecutableWith(taskBody, collectRanges(ranges));
        }
        if (!canRunCycle || !canAdvance(ranges)) {
          resolve();
        }
      }, 100);

      fin(function(){
        callExecutableWith(taskTail, collectRanges(ranges));
      });
    });
  }

  function _resolvedTask(){
    return new CrunchTask(function(init, body){
      body(function(resolve){
        resolve();
      });
    });
  }

  function callExecutableWith(task, args) {
    if (type.isFunction(task)) {
      task.apply(this, args);
    } else if (task instanceof CrunchTask){
      task.run.apply(task, args);
    }
  }

  function collectRanges(ranges){
    var result = [];
    for (var i = 0, maxI = ranges.length; i < maxI; i++) {
      result.push(ranges[i].current);
    }
    return result;
  }

  /**
   *
   * @param ranges
   * @param justCheck
   * @returns {boolean|*}
   */
  function canAdvance(ranges, justCheck){
    var currentR = 0,
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

      if (range.inclusive) {
        if ((range.step > 0) ? (range.current > range.to) : (range.current < range.to)) {
          range.current = range.from;
          counterOverflow = true;
          currentR++;
        }
      } else {
        if ((range.step > 0) ? (range.current >= range.to) : (range.current <= range.to)) {
          range.current = range.from;
          counterOverflow = true;
          currentR++;
        }
      }

      rangeInBounds = (currentR < maxR);

    } while (counterOverflow && rangeInBounds);

    return (!counterOverflow && rangeInBounds);
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
        step = ((rangeLength - ((lastIsBool) ? 1 : 0)) === 3)
            ? rangeSet[2]
            : ((rangeSet[0] <= rangeSet[1]) ? 1 : -1);
        return {
          from: rangeSet[0],
          current: rangeSet[0],
          to: rangeSet[1],
          step: step,
          inclusive: lastIsBool ? rangeSet[rangeLength - 1] : false
        };
      }

      case 0: // fallthrough
      case 1: // fallthrough
        error('Ranges', 'Use at least two values to define a range.');

      default:
        if (((rangeLength % 2) === 0) && ((rangeLength % 3) === 0)) {
          error('Ranges', 'Use arrays to split range parts. Cannot determine pattern now.')
        } else {
          error('Ranges', 'Use arrays to split range parts properly.');
        }
    }
  }

})();
