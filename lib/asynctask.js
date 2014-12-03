/**
 * Created by ANDREW on 10/10/2014.
 * @requires 'bower_components/promise-polyfill'
 */
CrunchTask = window.CrunchTask = (function (){

	var uid = 0;
	function nextUid(){
		return ++uid;
	}

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
	function _fnWrap(fn, aux) {
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

		//args1 = [].slice.call(arguments, 1);

		var stack;
		//try { throw new Error('Stack trace'); } catch (e){ stack = e.stack; }

		window.setTimeout(function(){
			//var s = stack;

			fn.apply(ctx, args0);
		}, timeoutAmount || 0);
	}

	function argsCapture(obj, prop) {
		var lock = false;
		return function(){
			if (lock) return;
			obj.isComplete = true;
			obj.status = prop;
			obj[prop] = [].slice.call(arguments, 0);
			lock = true;
		};
	}

	function protoRun(descriptionFn, evts){
		var self = this,
				args = [].slice.call(arguments, 2);
		this.state = 'beforeRunning';
		evts.trigger(EVENT_NAMES.run, this.state);
		var result,
				isSettled = null,
				updateSettledTrue = function(){
					if (isSettled === null) {
						isSettled = true;
					}
				},
				updateSettledFalse = function(){
					if (isSettled === null) {
						isSettled = false;
					}
				},
				updateSettledTrue = function(val){
					if (isSettled === null) {
						isSettled = val;
					}
				};

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
								needRepeat,
								timeoutAmount,
								finallyFn,
								{
									resolve: _fnWrap(_resolve, updateSettledTrue),
									reject: _fnWrap(_reject, updateSettledFalse),
									status: function(){
										return isSettled;
									},
									notify: _fnPartial(evts.on, EVENT_NAMES.progress)
								}
						);
					});
				} else {
					_fnWrap(_reject, updateSettledFalse)('empty.description');
				}
			});
		} finally {
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

			if (controlNexus.status() === null)
				do {
					try {
						timerStart = new Date();
						bodyFn(resolve, reject, notify);
					} catch (ex){
						reject(ex);
					}

					timerElapsed += (new Date() - timerStart);

				} while (!!needRepeat && (timerElapsed < timeLimit) && (controlNexus.status() === null));

			var _status = controlNexus.status();
			if (_needRepeat && ((_status === null) || (_status === 'paused'))) {
				return proceedBody.call(this, bodyFn, needRepeat, timeoutAmount, finallyFn, controlNexus);
			}

			try {
				if (finallyFn) {
					finallyFn.call(this, _status);
				}
			} catch (ex) {}
		});
	}

	var core = {
		//abort: protoAbort,
		//pause: protoPause,
		//resume: protoResume,
		toString: protoToString,
		valueOf: protoToString
	};

	for (var prop in core) {
		if (!core.hasOwnProperty(prop)) continue;
		CrunchTask.prototype[prop] = core[prop];
	}

	function protoAbort(){
		this.isCancelled = true;
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

	function events(ctx, obj){
		return {
			on: _fnBind(ctx, _on, obj),
			trigger: _fnBind(ctx, _trigger, obj)
		};
	}

	return CrunchTask;

	function CrunchTask(descriptionFn){
		if (!(this instanceof CrunchTask)) return new CrunchTask(descriptionFn);

		this.id = nextUid();
		this.timestamp = new Date() - 0;

		var evts = events(this, {});
		this.onRun = _fnPartial(evts.on, EVENT_NAMES.run);
		this.done = _fnPartial(evts.on, EVENT_NAMES.done);
		this.fail = _fnPartial(evts.on, EVENT_NAMES.fail);
		this.progress = _fnPartial(evts.on, EVENT_NAMES.progress);

		this.always = _fnPartial(evts.on, [EVENT_NAMES.done,EVENT_NAMES.fail].join());
		this.run = _fnPartial.call(this, protoRun, descriptionFn, evts);
		this.then = _fnPartial.call(this, protoThen, descriptionFn);
	}

})();

