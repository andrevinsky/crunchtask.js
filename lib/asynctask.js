/**
 * Created by ANDREW on 10/10/2014.
 * @requires 'bower_components/promise-polyfill'
 */
CrunchTask = window.CrunchTask = (function (){

	var uid = 0;
	function nextUid(){
		return ++uid;
	}
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
	function _on(hive, evt, fn){
		var args = [].slice.call(arguments, 3), evts = evt.split(/\s*,\s*/), evtName;
		var handlers;
		while (evtName = evts.shift()) {
			if ((handlers = hive[evt])) {
				handlers.push([fn, args]);
			} else {
				hive[evt] = [[fn, args]];
			}
		}
	}

	function _trigger(hive, evt){
		var args1 = [].slice.call(arguments, 2);
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

	function proceedBody(bodyFn, needRepeat, timeoutAmount, finallyFn, argsSink) {
		var ctx = this,
				timeLimit = (typeof needRepeat == 'number') ? needRepeat : 0;

		var _needRepeat = (needRepeat === 0) ? true : needRepeat;

		//if (_needRepeat) {
		defer.call(this, timeoutAmount || 0, function(){
			var timerStart, timerElapsed = 0;

			if (!this.isPaused && !this.isCancelled)
				do {
					try {
						timerStart = new Date();
						bodyFn(argsSink);
					} catch (ex){
						argsSink.exception(ex);
					}

					timerElapsed += (new Date() - timerStart);

				} while (!!needRepeat && (timerElapsed < timeLimit) && (!argsSink.state().isComplete));

			if (_needRepeat && (!argsSink.state().isComplete && !this.isCancelled)) {
				return proceedBody.call(this, bodyFn, needRepeat, timeoutAmount, finallyFn, argsSink);
			}

			try {
				if (finallyFn) {
					finallyFn.call(this, argsSink);
				}
			} catch (ex) {}

			proceedResults.call(this, argsSink.state());
		});

		//} else {
		//	defer.call(this, function(){
		//		try {
		//			bodyFn(argsSink);
		//			if (finallyFn) {
		//				finallyFn.call(this, argsSink);
		//			}
		//		} catch (ex){
		//			argsSink.exception(ex);
		//		}
		//		proceedResults.call(ctx, argsSink);
		//	});
		//}
	}

	function recordHandler(obj, prop, item){
		if (!item) return;
		if (!obj[prop]) {
			obj[prop] = [];
		}
		obj[prop].push(item);
	}

	function dispatchHandler(obj, prop, iterator) {
		var hive = obj[prop] || [], item;
		while (item = hive.shift()) {
			try {
				iterator(item);
			} catch (e) {}
		}
	}

	/**
	 *
	 * @param argsSink
	 */
	// TODO: make handlers into an array
	function proceedResults(argsSinkState) {
		if (!argsSinkState.isComplete) return;
		var status = argsSinkState.status,
				args = argsSinkState[status],
				ctx = this;

		dispatchHandler(this.handlers ||{}, status, function(nextTask){
			if (nextTask && (nextTask instanceof CrunchTask)) {
				nextTask.previousResult = args;
				argsSinkState = null;
				nextTask.run();
			} else if (nextTask && (typeof nextTask == 'function')) {
				defer.call(ctx , 0, nextTask, args);
			}
		});
	}

	var core = {
		//then: protoThen,
		//done: protoDone,
		//fail: protoFail,
		//always: protoAlways,
		abort: protoAbort,
		pause: protoPause,
		resume: protoResume,
		//run: protoRun,
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

	function protoRun(descriptionFn, evts){
		var self = this, args = [].slice.call(arguments, 2);
		this.state = 'beforeRunning';
		evts.trigger('event.run', this.state);
		var result = new Promise(function(resolve, reject){
			var thisTask = self,
					initFn,
					bodyFn,
					finallyFn,
					needRepeat,
					timeoutAmount;

			if (descriptionFn) {
				descriptionFn(function(suppliedInitFn){
					initFn = suppliedInitFn;
				}, function(suppliedBodyFn, suppliedNeedRepeat, suppliedTimeout){
					bodyFn = suppliedBodyFn;
					needRepeat = suppliedNeedRepeat;
					timeoutAmount = suppliedTimeout;
				}, function(suppliedFinallyFn){
					finallyFn = suppliedFinallyFn;
				});

				defer.call(this, 0, function(){
					if (initFn)
						initFn.apply(thisTask, args);

					var result = {};
					proceedBody.call(this, bodyFn, needRepeat, timeoutAmount, finallyFn, {
						resolve: argsCapture(result, 'success'),
						reject: argsCapture(result, 'failure'),
						exception: argsCapture(result, 'exception'),
						state: function(){ return result; }
					});
				});
			} else {
				reject('empty.description');
			}
		});

		result.then(function(arg){
			evts.trigger('event.done', arg);
		}, function(arg){
			evts.trigger('event.fail', arg);
		});

		return result;
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

	function CrunchTask(_arg0){
		if (!(this instanceof CrunchTask)) return new CrunchTask(_arg0);

		this.id = nextUid();
		this.timestamp = new Date() - 0;
		this.state = 'constructed';

		var isCopyCtor = (_arg0 instanceof CrunchTask); // copy constructor

		var descriptionFn = isCopyCtor ? _arg0._fn : _arg0;

		var evts = events(this, {});
		this.onRun = _fnPartial(evts.on, 'event.run');
		this.done = _fnPartial(evts.on, 'event.done');
		this.always = _fnPartial(evts.on, 'event.done,event.fail');
		this._fn = descriptionFn;
		this.run = _fnPartial.call(this, protoRun, descriptionFn, evts);
		this.then = _fnPartial.call(this, function(descriptionFn, evts){
				return new CrunchTask(descriptionFn).always()
		}, descriptionFn, evts);
	}

})();

