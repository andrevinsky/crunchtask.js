(function() {
    var root;

	if (typeof window === 'object' && window) {
		root = window;
	} else {
		root = global;
	}

	if (typeof module !== 'undefined' && module.exports) {
		module.exports = root.Promise ? root.Promise : Promise;
	} else if (!root.Promise) {
		root.Promise = Promise;
	}

	// Use polyfill for setImmediate for performance gains
	var asap = root.setImmediate || function(fn) { setTimeout(fn, 1); };

	// Polyfill for Function.prototype.bind
	function bind(fn, thisArg) {
		return function() {
			fn.apply(thisArg, arguments);
		}
	}

	var isArray = Array.isArray || function(value) { return Object.prototype.toString.call(value) === "[object Array]" };

	function Promise(fn) {
		if (typeof this !== 'object') throw new TypeError('Promises must be constructed via new');
		if (typeof fn !== 'function') throw new TypeError('not a function');
		this._state = null;
		this._value = null;
		this._deferreds = []

		doResolve(fn, bind(resolve, this), bind(reject, this))
	}

	function handle(deferred) {
		var me = this;
		if (this._state === null) {
			this._deferreds.push(deferred);
			return
		}
		asap(function() {
			var cb = me._state ? deferred.onFulfilled : deferred.onRejected
			if (cb === null) {
				(me._state ? deferred.resolve : deferred.reject)(me._value);
				return;
			}
			var ret;
			try {
				ret = cb(me._value);
			}
			catch (e) {
				deferred.reject(e);
				return;
			}
			deferred.resolve(ret);
		})
	}

	function resolve(newValue) {
		try { //Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
			if (newValue === this) throw new TypeError('A promise cannot be resolved with itself.');
			if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
				var then = newValue.then;
				if (typeof then === 'function') {
					doResolve(bind(then, newValue), bind(resolve, this), bind(reject, this));
					return;
				}
			}
			this._state = true;
			this._value = newValue;
			finale.call(this);
		} catch (e) { reject.call(this, e); }
	}

	function reject(newValue) {
		this._state = false;
		this._value = newValue;
		finale.call(this);
	}

	function finale() {
		for (var i = 0, len = this._deferreds.length; i < len; i++) {
			handle.call(this, this._deferreds[i]);
		}
		this._deferreds = null;
	}

	function Handler(onFulfilled, onRejected, resolve, reject){
		this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
		this.onRejected = typeof onRejected === 'function' ? onRejected : null;
		this.resolve = resolve;
		this.reject = reject;
	}

	/**
	 * Take a potentially misbehaving resolver function and make sure
	 * onFulfilled and onRejected are only called once.
	 *
	 * Makes no guarantees about asynchrony.
	 */
	function doResolve(fn, onFulfilled, onRejected) {
		var done = false;
		try {
			fn(function (value) {
				if (done) return;
				done = true;
				onFulfilled(value);
			}, function (reason) {
				if (done) return;
				done = true;
				onRejected(reason);
			})
		} catch (ex) {
			if (done) return;
			done = true;
			onRejected(ex);
		}
	}

	Promise.prototype['catch'] = function (onRejected) {
		return this.then(null, onRejected);
	};

	Promise.prototype.then = function(onFulfilled, onRejected) {
		var me = this;
		return new Promise(function(resolve, reject) {
			handle.call(me, new Handler(onFulfilled, onRejected, resolve, reject));
		})
	};

	Promise.all = function () {
		var args = Array.prototype.slice.call(arguments.length === 1 && isArray(arguments[0]) ? arguments[0] : arguments);

		return new Promise(function (resolve, reject) {
			if (args.length === 0) return resolve([]);
			var remaining = args.length;
			function res(i, val) {
				try {
					if (val && (typeof val === 'object' || typeof val === 'function')) {
						var then = val.then;
						if (typeof then === 'function') {
							then.call(val, function (val) { res(i, val) }, reject);
							return;
						}
					}
					args[i] = val;
					if (--remaining === 0) {
						resolve(args);
					}
				} catch (ex) {
					reject(ex);
				}
			}
			for (var i = 0; i < args.length; i++) {
				res(i, args[i]);
			}
		});
	};

	Promise.resolve = function (value) {
		if (value && typeof value === 'object' && value.constructor === Promise) {
			return value;
		}

		return new Promise(function (resolve) {
			resolve(value);
		});
	};

	Promise.reject = function (value) {
		return new Promise(function (resolve, reject) {
			reject(value);
		});
	};

	Promise.race = function (values) {
		return new Promise(function (resolve, reject) {
			for(var i = 0, len = values.length; i < len; i++) {
				values[i].then(resolve, reject);
			}
		});
	};
})();
/**
 * Created by ANDREW on 10/10/2014.
 * @requires 'bower_components/promise-polyfill'
 */
(function (){

  'use strict';

  /* jshint -W040 */

  var root = typeof window === 'object' && window ? window : global,
      __slice = [].slice,
      __hasOwnProperty = {}.hasOwnProperty;

  var type = (
      /**
       *
       * @returns {{isFunction(),isArray(),isBoolean(),isNumber(),isUndefined()}}
       */
      function(){

    //noinspection JSUnusedAssignment
        var result = {},
        __toString = Object.prototype.toString,
        _undef,
        sourceTypes = [true, 1, [], function(){}, _undef],
        classNamePattern = /\s+(\w+)]/,
        fullName,
        originalName; // PhantomJS bug

    for (var i = 0, maxI = sourceTypes.length; i < maxI; i++) {
      fullName = (originalName = __toString.call(sourceTypes[i])).replace('DOMWindow', 'Undefined'); // PhantomJS bug
      result['is' + fullName.match(classNamePattern)[1]] = getTestFor(originalName);
    }

    //noinspection JSValidateTypes
        return result;

    function getTestFor(fullName){
      return function(val) {
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
  function error(errType, msg){
    if (type.isUndefined(msg)){
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

  /**
   * @deprecated use range
   * @type {staticFor}
   */
  CrunchTask.for = staticFor;
  CrunchTask.range = staticFor;
  CrunchTask.rangeCheck = normalizeRanges;
  CrunchTask.rangeNextAndCheck = canAdvance;

  var uid = 0;

  /**
   * Generates new id.
   * @returns {number}
   */
  function nextUid(){
    return ++uid;
  }

  var EVENT_NAMES = _initObjectProps({
            run: null,
            done: null,
            fail: null,
            abort: null,
            error: null,
            progress: null,
            idle: null
          }, 'event.') ,
      STATE_NAMES = _initObjectProps({
            init:  null,
            error:  null,
            running:  null,
            paused:  null,
            resolved:  null,
            rejected:  null,
            aborted:  null
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
    for(var prop in obj) {
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

    for(var i = 0, iMax = arr.length; i < iMax; i++) {
      result[arr[i]] = isArray ? value[i] : value;
    }

    return result;
  }

  function _objExtend(target, source) {
    for(var prop in source) {
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
   * @params {...*} args
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
   *
   * @params {...function} fns
   * @returns {Function}
   * @private
   */
  function _fnTogether(/* fns */) {
    var auxFns = __slice.call(arguments, 0);
    return function() {
      var args = __slice.call(arguments, 0),
          auxFn;
      while ((auxFn = auxFns.shift()) && type.isFunction(auxFn)) {
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
   * @params {...*} args
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
   * @param {number} timeoutAmount
   * @param {function} fn
   * @param {[]} args0
   */
  function defer(timeoutAmount, fn , args0) {
    var ctx = this;

    return setTimeout(function(){
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
    if (type.isUndefined(fn)) {
      fn = function(){};
    }
    return function(){
      var args0 = __slice.call(arguments, 0);
      try {
        fn.apply(ctx, args0);
        return true;
      } catch(e){
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
  function protoRun(descriptionFn, taskEvents){
    var thisTask = this;

    var instanceApi = {},
        runCtx = {
          task: thisTask,
          id: 'T_' + thisTask.id + ':' + nextUid(),
          conditionsToMeet: 1,
          state: STATE_NAMES.init,
          runBlock: 0,
          runArgs: __slice.call(arguments, 2),
          descriptionFn: descriptionFn
        },
        encapsulation = null,
        promiseFn = function(_resolve, _reject){

          encapsulation = _fnPartial(runCtx, encapsulateRunInstance,
              instanceApi, taskEvents, {
                resolve: _resolve,
                reject: _reject
              }
          );

          defer.call(runCtx,
              0, proceedDescriptionFn, [instanceApi]);
        };

    return overloadPromise(new Promise(promiseFn), instanceApi, encapsulation);

  }

  function overloadPromise(promise, instanceApi, sealEncapsulationFn){

    sealEncapsulationFn(promise);

    return _objExtend(promise, {
      onError: _fnPartial(promise, instanceApi.runEventsOn, EVENT_NAMES.error),

      abort: _fnPartial(promise, instanceApi.abort),
      pause: _fnPartial(promise,instanceApi.pause),
      resume: _fnPartial(promise,instanceApi.resume),

      done: _fnPartial(promise, instanceApi.runEventsOn, EVENT_NAMES.done),
      fail: _fnPartial(promise, instanceApi.runEventsOn, EVENT_NAMES.fail),
      always: _fnPartial(promise, instanceApi.runEventsOn, [EVENT_NAMES.done,EVENT_NAMES.fail,EVENT_NAMES.error].join())
    });
  }

  function encapsulateRunInstance(instanceApi, taskEvents, resolveReject, promise) {

    var ctx = this,
        thisTask = ctx.task,
        resolveSafe = safe(resolveReject.resolve),
        rejectSafe = safe(resolveReject.reject),
        runEvents = serveEvents(promise),
        triggerBoth = _fnTogether(runEvents.trigger, taskEvents.trigger);

    return _objExtend(instanceApi, {

      /**
       *
       * @param _initFn
       * @returns {*}
       */
      setupInit: function (_initFn) {
        if (SETTLED_STATES[ctx.state]) { return; }

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
        if (SETTLED_STATES[ctx.state]) { return; }

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

        ctx.needRepeat = ((_needRepeat !== false) ? (_needRepeat || 0) : _needRepeat);
        ctx.timeoutAmount = _timeout;
      },

      /**
       *
       * @param _finallyFn
       * @returns {*}
       */
      setupFin: function (_finallyFn) {
        if (SETTLED_STATES[ctx.state]) { return; }
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
      goRunning: function(){
        thisTask.runCount++;
        ctx.state = STATE_NAMES.running;
        taskEvents.trigger(EVENT_NAMES.run, ctx.id); // no need to call runInst
      },
      /**
       *
       */
      resolve: function(){
        if (SETTLED_STATES[ctx.state]) { return; }
        var args0 = __slice.call(arguments, 0);
        ctx.state = STATE_NAMES.resolved;
        ctx.value = args0;

        decreaseRunning(thisTask);

        signalGeneric(args0, EVENT_NAMES.done, resolveSafe);
      },
      /**
       *
       */
      reject: function(){

        if (SETTLED_STATES[ctx.state]) { return; }
        var args0 = __slice.call(arguments, 0);
        ctx.state = STATE_NAMES.rejected;
        ctx.value = args0;

        decreaseRunning(thisTask);

        signalGeneric(args0, EVENT_NAMES.fail, rejectSafe);
      },
      abort: function(){
        if (SETTLED_STATES[ctx.state]) { return; }
        ctx.state = STATE_NAMES.aborted;
        return this;
      },

      pause: function (){
        if (SETTLED_STATES[ctx.state]) { return; }
        ctx.state = STATE_NAMES.paused;
        return this;
      },

      resume: function(){
        if (SETTLED_STATES[ctx.state]) { return; }
        ctx.state = STATE_NAMES.running;
        return this;
      },

      sendNotify: _fnPartial(triggerBoth, EVENT_NAMES.progress)

    });

    function signalError(){
      if (SETTLED_STATES[ctx.state]) { return; }

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

    function decreaseRunning(thisTask){
      if (!thisTask.runCount) { return; }
      thisTask.runCount--;
      if (thisTask.runCount) { return; }

      delete thisTask.isAborted;
      delete thisTask.isPaused;

      var fn = _fnPartial(thisTask, taskEvents.trigger, EVENT_NAMES.idle);
      defer(1, function(){
        if (thisTask.runCount) { return; }
        fn();
      }, []);
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
      _needRepeat = ((_needRepeat !== false) ? (_needRepeat || 0) : _needRepeat);

      ctx.needRepeat = (_needRepeat === 0) ? true : _needRepeat;
      ctx.timeoutAmount = ctx.timeoutAmount || 0;

      instanceApi.goRunning();

      // schedule init, body, fin, etc.
      defer.call(ctx, 0, function(){

        if (this.initFn && !this.initFn.apply(this, this.runArgs)) {
          instanceApi.signalError('CrunchTask.description.init');
        }

        proceedBodyFn.call(this, instanceApi);

      });

    } else {
      // bad outcome, reject
      return instanceApi.signalError('CrunchTask.description.else', '');
    }
  }

  function proceedBodyFn(instanceApi){
    this.currentTimeout = defer.call(this, this.timeoutAmount, function(instanceApi){
      //noinspection JSPotentiallyInvalidUsageOfThis
      delete this.currentTimeout;

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
              batchIndex: miniRunCount,
              batchElapsed: timerElapsed,
              runBlock: this.runBlock
            });

          } catch(ex) {
            instanceApi.signalError('body', ex);
          }

          timerElapsed += (new Date() - timerStart);
          miniRunCount++;

          canRepeatThisLoop = needRepeat &&
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

  function serveEvents(ctx, _obj){
    var obj = _obj || {};
    return {
      on: _fnBind(ctx, _on, obj),
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
  function CrunchTask(descriptionFn){
    // always dealing with the `new` keyword instantiation
    if (!(this instanceof CrunchTask)) {
      return new CrunchTask(descriptionFn);
    }

    //if (!type.isFunction(descriptionFn)) {
    //  return error('CrunchTask.ctor', 'Single argument is required: `fn(initFn,bodyFn,finFn)`');
    //}
    return prepareBlankTask(this, serveEvents(this), descriptionFn);
  }

  function prepareBlankTask(task, events, descriptionFn) {
    return _objExtend(task, {
      id: nextUid(),
      timestamp: new Date() - 0,
      runCount: 0,
      isIdle: function isIdle(){
        return task.runCount === 0;
      },

      pause: _fnBind(task, protoPause),
      resume: _fnBind(task, protoResume),
      abort: _fnBind(task, protoAbort),

      run: _fnPartial(task, protoRun, descriptionFn, events),
      then: _fnPartial(task, protoThen, descriptionFn),

      onRun: _fnPartial(events.on, EVENT_NAMES.run),
      onIdle: _fnPartial(events.on, EVENT_NAMES.idle),
      onError: _fnPartial(events.on, EVENT_NAMES.error),
      done: _fnPartial(events.on, EVENT_NAMES.done),
      fail: _fnPartial(events.on, EVENT_NAMES.fail),
      always: _fnPartial(events.on, [EVENT_NAMES.done,EVENT_NAMES.fail,EVENT_NAMES.error].join()),
      progress: _fnPartial(events.on, EVENT_NAMES.progress)
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
      return resolvedTask();
    }

    return internalFor(ranges, taskBody, taskTail);
  }

  function normalizeRanges(){
    var args = __slice.call(arguments, 0);
    return translateRangeArgs(parseRangeArgs(args));
  }

  function internalFor(_ranges,  taskBody, taskTail){
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

  function resolvedTask(){
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
   * @param {boolean} [justCheck]
   * @returns {boolean}
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

      if ((!range.inclusive && (range.current === range.to)) || ((range.step > 0) ? (range.current > range.to) : (range.current < range.to))) {
        range.current = range.from;
        counterOverflow = true;
        currentR++;
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
        step = (((rangeLength - ((lastIsBool) ? 1 : 0)) === 3) ?
            rangeSet[2] : ((rangeSet[0] <= rangeSet[1]) ? 1 : -1));
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
        break;

      default:
        if (((rangeLength % 2) === 0) && ((rangeLength % 3) === 0)) {
          error('Ranges', 'Use arrays to split range parts. Cannot determine pattern now.');
        } else {
          error('Ranges', 'Use arrays to split range parts properly.');
        }
    }
  }

})();
