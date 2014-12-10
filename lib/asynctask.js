/**
 * Created by ANDREW on 10/10/2014.
 * @requires 'bower_components/promise-polyfill'
 */
CrunchTask = window.CrunchTask = (function (){

	var uid = 0;
	function nextUid(){
		return ++uid;
	}

	//var tasks = {};

	var EVENT_NAMES = {
		run: 'event.run',
		done: 'event.done',
		fail: 'event.fail',
		progress: 'event.progress'
	};

	function _fnPartial(fn){
		var ctx = this, args0 = [].slice.call(arguments, 1);
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
	function _fnWrapArgsFor(fn, aux) {
		var args0 = [].slice.call(arguments, 1);
		return function(){
			var args1 = [].slice.call(arguments, 0), auxFn;
			while (auxFn = args0.shift())
				auxFn();
			// !IGNORE Exceptions, might be a call to Promise::reject, it causes exceptions!
			return fn.call(this, args1);
		};
	}
	function _on(hive, evt, fn){
		if (!fn) return;
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
		if ((args1.length === 1) && (Object.prototype.toString.call(args1[0]) === '[object Array]')) args1 = args1[0]; // unwrap
		if (!hive[evt]) return;
		var handlers = hive[evt];
		for(var pair, handler, args0, i = 0, maxI = handlers.length; i < maxI; i++){
			pair = handlers[i];
			handler = pair[0];
			args0 = pair[1];
			if (!handler) continue;
			try {
				handler.apply(this, [].concat(args0, args1));
			} catch (e){
				console.info(e);
			}
		}
	}
	function defer(timeoutAmount, fn, args0) {
		var ctx = this;
		window.setTimeout(function(){
			fn.apply(ctx, args0);
		}, timeoutAmount || 0);
	}

	function protoRun(descriptionFn, evts){
		var self = this,
				args = [].slice.call(arguments, 2);

		var debugId = args[0];

		delete this.isPaused;
		delete this.isAborted;

		evts.trigger(EVENT_NAMES.run);

		var result;

		var runState = (function(seed){
			var ctx = {
				isSettled: null
			}, _id = seed;
			return {
				updateSettledTrue: function(){
					var id = _id;
					if (ctx.isSettled === null) {
						ctx.isSettled = true;
					}
				},
				updateSettledFalse: function(){
					var id = _id;
					if (ctx.isSettled === null) {
						ctx.isSettled = false;
					}
				},
				updateSettledVal: function(val){
					var id = _id;
					if ((ctx.isSettled === null) || (ctx.isSettled === 'paused')) {
						ctx.isSettled = val;
					}
				},
				status: function(){
					var id = _id;
					return ctx.isSettled;
				}
			}
		})(this.id);



		try {
			return result = new Promise(function(_resolve, _reject){

				var thisTask = self,
						initFn, bodyFn, finallyFn,
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

					defer.call(this, 0, function () {
						if (initFn) {
							initFn.apply(thisTask, args);
						}

						proceedBody.call(this,
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
			});
		} finally {

			result.abort = _fnPartial(runState.updateSettledVal, 'aborted');
			result.pause = _fnPartial(runState.updateSettledVal, 'paused');
			result.resume = _fnPartial(runState.updateSettledVal, null);

			result.then(
					_fnPartial(evts.trigger, EVENT_NAMES.done),
					_fnPartial(evts.trigger, EVENT_NAMES.fail)
			);
		}
	}


	function proceedBody(bodyFn, needRepeat, timeoutAmount, finallyFn, controlNexus) {
		var ctx = this,
				resolve = controlNexus.resolve,
				reject = controlNexus.reject,
				notify = controlNexus.notify,
				timeLimit = (typeof needRepeat == 'number') ? needRepeat : 0;

		var _needRepeat = (needRepeat === 0) ? true : needRepeat;

		defer.call(this, timeoutAmount || 0, function(){
			var timerStart, timerElapsed = 0;

			var canExecuteNextLoop = (
					(controlNexus.status() === null)
						&& !this.isPaused
						&& !this.isAborted),
					canRepeatThisLoop,
					canQueueNextBatch;

			if (canExecuteNextLoop) {
				do {
					try {
						timerStart = new Date();
						bodyFn(resolve, reject, notify);
					} catch (ex){
						reject(ex);
					}

					timerElapsed += (new Date() - timerStart);

					canRepeatThisLoop = ((!!_needRepeat)
						&& (timerElapsed < timeLimit)
						&& (controlNexus.status() === null));
				} while (canRepeatThisLoop);
			} else if (this.isAborted || (controlNexus.status() === 'aborted')) {
				reject('aborted');
			}

			var _status = controlNexus.status();
			canQueueNextBatch = ((!!_needRepeat)
					&& ((_status === null) || (_status === 'paused'))
					&& !this.isAborted);

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

	var core = {
		toString: protoToString,
		valueOf: protoToString
	};

	for (var prop in core) {
		if (!core.hasOwnProperty(prop)) continue;
		CrunchTask.prototype[prop] = core[prop];
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

	function protoThen(descriptionFn, tasks_){
		var args0 = [].slice.call(arguments, 1), _newTask;
		try {
			return (_newTask = new CrunchTask(descriptionFn));
		} finally {
			_newTask.done(function () {
				var args1 = [].slice.call(arguments, 0), task;
				while ((task = args0.shift())) {
					if (!(task instanceof CrunchTask)) continue;
					task.run.apply(task, args1);
				}
			});
		}
	}

	function protoToString(){
		return '[CrunchTask id: #' + this.id + ' created @:' + this.timestamp +']';
	}

	function serveEvents(ctx, obj){
		return {
			on: _fnBind(ctx, _on, obj),
			trigger: _fnBind(ctx, _trigger, obj)
		};
	}

	return CrunchTask;

	function CrunchTask(descriptionFn){
		if (!(this instanceof CrunchTask)) return new CrunchTask(descriptionFn);
		if (!(descriptionFn instanceof Function)) throw new Error('instantiate with description function fn(initFn,bodyFn,finFn)');

		this.id = nextUid();
		this.timestamp = new Date() - 0;

		var events = serveEvents(this, {});

		this.run = _fnPartial.call(this, protoRun, descriptionFn, events);
		this.then = _fnPartial.call(this, protoThen, descriptionFn);

		this.pause = _fnBind(this, protoPause);
		this.resume = _fnBind(this, protoResume);
		this.abort = _fnBind(this, protoAbort);

		this.onRun = _fnPartial(events.on, EVENT_NAMES.run);
		this.done = _fnPartial(events.on, EVENT_NAMES.done);
		this.fail = _fnPartial(events.on, EVENT_NAMES.fail);
		this.always = _fnPartial(events.on, [EVENT_NAMES.done,EVENT_NAMES.fail].join());
		this.progress = _fnPartial(events.on, EVENT_NAMES.progress);

		//tasks[this.id] = this;
	}

})();

