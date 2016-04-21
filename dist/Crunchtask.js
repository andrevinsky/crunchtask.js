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

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
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
    resolved: null,
    rejected: null,
    error: null,
    aborted: null,
    running: null,
    paused: null
  });

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

  var CrunchInstancePromise = function CrunchInstancePromise(fn) {
    _classCallCheck(this, CrunchInstancePromise);

    return new Promise(fn);
  };

  var CrunchInstance = function (_CrunchInstancePromis) {
    _inherits(CrunchInstance, _CrunchInstancePromis);

    function CrunchInstance(parentTask, descriptionFn, events, args) {
      _classCallCheck(this, CrunchInstance);

      var taskResolve = void 0,
          taskReject = void 0;
      return _possibleConstructorReturn(this, Object.getPrototypeOf(CrunchInstance).call(this, function (rs, rj) {
        taskResolve = rs;
        taskReject = rj;
      }));
    }

    return CrunchInstance;
  }(CrunchInstancePromise);

  var CrunchExec = function CrunchExec(descriptionFn) {
    var _this2 = this;

    _classCallCheck(this, CrunchExec);

    var result = void 0,
        events = void 0;
    try {
      return result = function result() {
        for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
          args[_key4] = arguments[_key4];
        }

        return new CrunchInstance(_this2, descriptionFn, events, args);
      };
    } finally {
      result.events = events = serveEvents(result);
    }
  };

  var Crunchtask = function (_CrunchExec) {
    _inherits(Crunchtask, _CrunchExec);

    function Crunchtask(descriptionFn) {
      _classCallCheck(this, Crunchtask);

      var then = function then() {
        for (var _len5 = arguments.length, tasks = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
          tasks[_key5] = arguments[_key5];
        }

        var doneHandler = function doneHandler() {
          for (var _len6 = arguments.length, args = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
            args[_key6] = arguments[_key6];
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
          _this3.done(doneHandler);
        }
      };

      var _this3 = _possibleConstructorReturn(this, Object.getPrototypeOf(Crunchtask).call(this, descriptionFn));

      var events = _this3.events;
      delete _this3.events;

      Object.assign(_this3, {
        id: nextUid(),
        timestamp: new Date() - 0,
        runCount: 0,
        then: then,
        onRun: partial(events.on, EVENT_NAMES.run),
        onIdle: partial(events.on, EVENT_NAMES.idle),
        onError: partial(events.on, EVENT_NAMES.error),
        done: partial(events.on, EVENT_NAMES.done),
        fail: partial(events.on, EVENT_NAMES.fail),
        always: partial(events.on, [EVENT_NAMES.done, EVENT_NAMES.fail, EVENT_NAMES.error].join()),
        progress: partial(events.on, EVENT_NAMES.progress),
        isIdle: function isIdle() {
          return _this3.runCount === 0;
        },
        pause: function pause() {
          _this3.isPaused = true;
          return _this3;
        },
        resume: function resume() {
          delete _this3.isPaused;
          return _this3;
        },
        abort: function abort() {
          _this3.isAborted = true;
          return _this3;
        },
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

  Object.assign(result, {
    isBuddy: function isBuddy(input) {
      return input instanceof Crunchtask;
    }
  });

  module.exports = Crunchtask;
});