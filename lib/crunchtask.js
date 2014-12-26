/**
 * Created by ANDREW on 10/10/2014.
 * @requires 'bower_components/promise-polyfill'
 */
(function (){

	var root = typeof window === 'object' && window ? window : global;

	if (typeof module !== 'undefined' && module.exports) {
		module.exports = root.CrunchTask ? root.CrunchTask : CrunchTask;
	} else if (!root.CrunchTask) {
		root.CrunchTask = CrunchTask;
	}

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
			if (source.hasOwnProperty(prop)) {
				target[prop] = source[prop];
			}
		}
		return target;
	}

	function _fnPartial(fn){
		var ctx = this, args0 = [].slice.call(arguments, 1);
		if ((typeof fn !== 'function') && (typeof args0[0] === 'function')) {
			ctx = arguments[0];
			fn = args0.shift();
		}
		return function(){
			var args1 = [].slice.call(arguments, 0);
			return fn.apply(ctx, [].concat(args0, args1));
		};
	}
	function _fnBind(ctx, fn) {
		var args0 = [].slice.call(arguments, 2);
		return function(){
			var args1 = [].slice.call(arguments, 0);
			return fn.apply(ctx, [].concat(args0, args1));
		};
	}
	function _fnWrapArgsFor(fn /*, aux...*/) {
		var args0 = [].slice.call(arguments, 1);
		return function(){
			var args1 = [].slice.call(arguments, 0), auxFn;
			while ((auxFn = args0.shift()) && (typeof auxFn === 'function')) {
				auxFn();
			}
			// !IGNORE Exceptions, might be a call to Promise::reject, it causes exceptions!
			return fn.call(this, args1);
		};
	}
	function _on(hive, evt, fn){
		if (!fn) { return; }
		var args = [].slice.call(arguments, 3),
				evts = evt.split(/\s*,\s*/), evtName;
		var handlers;
		while (evtName = evts.shift()) {
			if ((handlers = hive[evtName])) {
				handlers.push([fn, args]);
			} else {
				hive[evtName] = [[fn, args]];
			}
		}
	}
	function _trigger(hive, evt){
		var args1 = [].slice.call(arguments, 2);
		if ((args1.length === 1) && (Object.prototype.toString.call(args1[0]) === '[object Array]')) {
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
	function defer(timeoutAmount, fn, args0) {
		var ctx = this;
		setTimeout(function(){
			fn.apply(ctx, args0);
		}, timeoutAmount || 0);
	}

	function protoRun(descriptionFn, evts){
		var thisTask = this,
				args = [].slice.call(arguments, 2);

		delete this.isPaused;
		delete this.isAborted;

		this.runCount++;

		evts.trigger(EVENT_NAMES.run);

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
									notify: _fnPartial(evts.trigger, EVENT_NAMES.progress),
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
					_fnPartial(evts.trigger, EVENT_NAMES.done),
					_fnPartial(evts.trigger, EVENT_NAMES.fail)
			);

			result.then(function(){
				if (thisTask.isIdle()) {
					evts.trigger(EVENT_NAMES.idle);
				}
			}, function(){
				if (thisTask.isIdle()) {
					evts.trigger(EVENT_NAMES.idle);
				}
			});
		}
	}


	function proceedBody(bodyFn, needRepeat, timeoutAmount, finallyFn, controlNexus) {
		var resolve = controlNexus.resolve,
				reject = controlNexus.reject,
				notify = controlNexus.notify,
				timeLimit = (typeof needRepeat === 'number') ? needRepeat : 0;

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
		var args0 = [].slice.call(arguments, 1), _newTask;
		try {
			return (_newTask = new CrunchTask(descriptionFn));
		} finally {
			_newTask.done(function () {
				var args1 = [].slice.call(arguments, 0), task;
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
		if (typeof descriptionFn !== 'function') {
			throw new Error('instantiate with description function fn(initFn,bodyFn,finFn)');
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

})();

