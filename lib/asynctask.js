/**
 * Created by ANDREW on 10/10/2014.
 */
CrunchTask = window.CrunchTask = (function (){

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

		dispatchHandler(this.handlers, status, function(nextTask){
			if (nextTask && (nextTask instanceof CrunchTask)) {
				nextTask.previousResult = args;
				argsSinkState = null;
				nextTask.run();
			} else if (nextTask && (typeof nextTask == 'function')) {
				defer.call(ctx , 0, nextTask, args);
			}
		});
	}

	CrunchTask.prototype.then = function(newTaskSuccess, newTaskFail, newTaskException){
		recordHandler(this.handlers, 'success', newTaskSuccess);
		recordHandler(this.handlers, 'failure', newTaskFail);
		recordHandler(this.handlers, 'exception', newTaskException);
		return this;
	};

	CrunchTask.prototype.done = function(newTaskSuccess){
		recordHandler(this.handlers, 'success', newTaskSuccess);
		return this;
	};

	CrunchTask.prototype.fail = function(newTaskFail){
		recordHandler(this.handlers, 'failure', newTaskFail);
		return this;
	};

	CrunchTask.prototype.always = function(newTaskFail){
		recordHandler(this.handlers, 'always', newTaskFail);
		return this;
	};

	CrunchTask.prototype.cancel = function(){
		this.isCancelled = true;
		return this;
	};
	CrunchTask.prototype.pause = function(){
		this.isPaused = true;
		return this;
	};
	CrunchTask.prototype.resume = function(){
		delete this.isPaused;
		return this;
	};

	CrunchTask.prototype.run = function(){

		var args = (this.previousResult) ? this.previousResult : [].slice.call(arguments, 0);

		delete this.previousResult;

		var thisTask = this,
				initFn,
				bodyFn,
				finallyFn,
				needRepeat,
				timeoutAmount;

		if (!this.descriptionFn) return this;
		this.descriptionFn(function(suppliedInitFn){
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

		return this;
	};

	return CrunchTask;

	function CrunchTask(descriptionFn){
		if (!(this instanceof CrunchTask)) return new CrunchTask(descriptionFn /*(inFn, doFn(q))*/ );
		this.descriptionFn = descriptionFn;
		this.handlers = {};
	}

})();

