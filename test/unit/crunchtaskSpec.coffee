#http://coffeescript.org/
Math.log10 = `function (x) { return Math.log(x) / Math.LN10; };`

CrunchTask = CrunchTask
Promise = Promise

if (typeof require is 'function')
  CrunchTask = require('../../lib/crunchtask')
  Promise = require('../../node_modules/promise-polyfill/Promise')
  utils = require('./utils.coffee')

root = typeof window is 'object' && window ? window : global
type = root.type || utils.type
whenAll = root.whenAll || utils.whenAll

describe 'TaskCruncher Specification ', ->

  it 'Use Jasmine with Version 2.xx', ->
    console.log "\r\n
jasmine.version= #{jasmine.version}
\r\n"
    expect(jasmine.version).toMatch(/^2\./);
    return


  describe 'Usage Patterns: ', ->
    task = null
    console.log "jasmine.DEFAULT_TIMEOUT_INTERVAL = #{ jasmine.DEFAULT_TIMEOUT_INTERVAL}"

    beforeEach () ->
      return

    afterEach ()->
      task.abort() unless task is null
      task = null
      return

    it 'Use a function named a _description function_ to describe the task\'s initialization, body, and finalization. It is executed only when the task is run and under the same stack.', (done)->

      foo = {
        ctor:  (init, body, fin)->
      }

      spyOn(foo, 'ctor').and.callThrough()

      task = new CrunchTask foo.ctor
      expect(foo.ctor).not.toHaveBeenCalled()

      task.run()

      setTimeout ()->
        expect(foo.ctor).toHaveBeenCalled()
        done()
        return
      , 0

      return

    it 'When a task is run, the _description function_ receives the 3 functions as parameters: `init`, `body`, `fin`, called _init setup_, _body setup_, and _fin setup_ respectively.', (done) ->
      task = new CrunchTask (init, body, fin)->

        expect(init).toBeDefined()
        expect(type(init)).toEqual('function')

        expect(body).toBeDefined()
        expect(type(body)).toEqual('function')
        body ()->
          return

        expect(fin).toBeDefined()
        expect(type(fin)).toEqual('function')

        done()
        return

      task.run().abort()
      return

    it 'The _init setup_ function (`init` parameter) expects to be called with a single parameter, called an _init function_. It provides the means to inject runtime values (passed to the the `task.run(args...)` method) into the common execution scope. This scope is found under the _description function_.', (done) ->
      task1 = new CrunchTask (init, body, fin)->
        arg1 = null
        arg2 = null
        init (_arg1, _arg2)->
          expect(_arg1).not.toBeDefined()
          expect(_arg2).not.toBeDefined()
          arg1 = _arg1
          arg2 = _arg2
          return
        body (resove)->
          resove()
          return
        return

      task2 = new CrunchTask (init, body, fin)->
        arg1 = null
        arg2 = null
        init (_arg1, _arg2)->
          expect(_arg1).toBeDefined()
          expect(_arg1).toEqual(123)
          expect(_arg2).not.toBeDefined()
          arg1 = _arg1
          arg2 = _arg2
          return
        body (resove)->
          resove()
          return
        return

      task3 = new CrunchTask (init, body, fin)->
        arg1 = null
        arg2 = null
        init (_arg1, _arg2)->
          expect(_arg1).toBeDefined()
          expect(_arg1).toEqual(1234)

          expect(_arg2).toBeDefined()
          expect(_arg2).toEqual('X456')
          return
        body (resove)->
          resove()
          return
        return

      whenAll task1.onIdle, task2.onIdle, task3.onIdle, ()->
        do tsk.abort for tsk in [task1, task2, task3] when tsk
        task1 = task2 = task3 = null
        done()
        return

      task1.run()
      task2.run(123)
      task3.run(1234, 'X456')
      return


    it 'The _body setup_ function (`body` parameter) expects to be called with a single function, called a _body function_, which operates on values injected with the `init` into the common scope.', (done)->
      task = new CrunchTask (init, body, fin)->
        # Declaration
        arg1 = null
        arg2 = null

        init (_arg1, _arg2)->
          # Assignemnt
          arg1 = _arg1
          arg2 = _arg2
          return

        body (resolve)->
          # Operations
          result = arg1 + arg2
          expect(result).toBeDefined()
          expect(result).toEqual(123 + 456)

          done()
          resolve()
          return
        return

      task.run(123, 456)
      return

    it 'The _body function_ controls the flow with a help from two functions taken directly from an underlining Promise instance and passed here as two leading parameters with the same names: `resolve` and `reject`. Once they\'re called, no more calls to the _body function_ will be made during this run.', (done) ->

      foo = {
        taskBodyResolve:  (resolve, reject)->
          resolve(123)
          return
        taskBodyReject:  (resolve, reject)->
          reject(456)
          return
        taskBodyInfinite:  (resolve, reject)->
          return
      }

      spyOn(foo, 'taskBodyResolve').and.callThrough()
      spyOn(foo, 'taskBodyReject').and.callThrough()
      spyOn(foo, 'taskBodyInfinite').and.callThrough()

      task1 = new CrunchTask (init, body, fin)->
        body foo.taskBodyResolve
        return

      task2 = new CrunchTask (init, body, fin)->
        body foo.taskBodyReject
        return

      task3 = new CrunchTask (init, body, fin)->
        body foo.taskBodyInfinite
        return

      expect(foo.taskBodyResolve).not.toHaveBeenCalled()
      expect(foo.taskBodyReject).not.toHaveBeenCalled()
      expect(foo.taskBodyInfinite).not.toHaveBeenCalled()

      task1.run()
      task2.run()
      task3.run()

      setTimeout task3.abort, 500

      whenAll task1.onIdle, task2.onIdle, task3.onIdle, ()->

        expect(foo.taskBodyResolve).toHaveBeenCalled()
        expect(foo.taskBodyResolve.calls.count()).toEqual(1)

        expect(foo.taskBodyReject).toHaveBeenCalled()
        expect(foo.taskBodyReject.calls.count()).toEqual(1)

        expect(foo.taskBodyInfinite).toHaveBeenCalled()
        expect(foo.taskBodyInfinite.calls.count()).toBeGreaterThan(1)
        done()

        do tsk.abort for tsk in [task1, task2, task3] when tsk
        task1 = task2 = task3 = null
        setTimeout done, 10
        return

      return

    it 'The task\'s results (passed to `resolve()`/`reject()`) are wrapped into an array to present a single argument for Promise `then()` listeners, and are passed as given to the Task\'s result handlers.', (done) ->

      foo = {
        resolvePromiseCallback: (arg) ->
          expect(arg).toEqual([123])
          return

        rejectPromiseCallback: (arg) ->
          expect(arg).toEqual([456])
          return

        resolveTaskCallback: (arg) ->
          expect(arg).toEqual(123)
          return

        rejectTaskCallback: (arg) ->
          expect(arg).toEqual(456)
          return

        resolveRunInstanceCallback: (arg) ->
          expect(arg).toEqual(123)
          return

        rejectRunInstanceCallback: (arg) ->
          expect(arg).toEqual(456)
          return
      }

      spyOn(foo, 'resolvePromiseCallback').and.callThrough()
      spyOn(foo, 'rejectPromiseCallback').and.callThrough()
      spyOn(foo, 'resolveTaskCallback').and.callThrough()
      spyOn(foo, 'rejectTaskCallback').and.callThrough()
      spyOn(foo, 'resolveRunInstanceCallback').and.callThrough()
      spyOn(foo, 'rejectRunInstanceCallback').and.callThrough()

      task1 = new CrunchTask (init, body, fin)->
        body (resolve, reject)->
          resolve 123
          return
        return

      task2 = new CrunchTask (init, body, fin)->
        body (resolve, reject)->
          reject 456
          return
        return


      task1.done foo.resolveTaskCallback

      task1.run().done(foo.resolveRunInstanceCallback).then(foo.resolvePromiseCallback, foo.rejectPromiseCallback)

      task2.fail foo.rejectTaskCallback
      task2.run().fail(foo.rejectRunInstanceCallback).then(foo.resolvePromiseCallback, foo.rejectPromiseCallback)

      whenAll task1.onIdle, task2.onIdle, ()->

        setTimeout ()->
          #Promise callbacks
          expect(foo.resolvePromiseCallback).toHaveBeenCalled()
          expect(foo.rejectPromiseCallback).toHaveBeenCalled()

          #Task callbacks
          expect(foo.resolveTaskCallback).toHaveBeenCalled()
          expect(foo.rejectTaskCallback).toHaveBeenCalled()

          do tsk.abort for tsk in [task1, task2] when tsk
          task1 = task2 = null

          done()
          return
        , 100
        return

      return

    it 'The second parameter to the _body setup_ is usually a number. The _body_ function is run as many times as long the execution time stays under the specified amount of milliseconds.', (done)->
      foo = {
        bar: () ->
      }
      spyOn(foo, 'bar').and.callThrough()

      batchExecTimeLimitMilliseconds = 100
      runCount = 25000

      task = new CrunchTask (init, body, fin)->
        # Declaration, pre-initialization
        count = 0

        init (_count) ->
          # Assignment
          count = _count
          return

        body (resolve, reject, notify, diag)->
          foo.bar(diag.batchStarted - 0, diag.batchIndex, diag.batchElapsed, diag.runBlock)
          resolve() unless (--count)
          return

        , batchExecTimeLimitMilliseconds
        return

      task.onIdle ()->
        callsCount = foo.bar.calls.count()
        batchUsed = {}
        batchCount = 0

        getBatchStarted = (idx) ->
          foo.bar.calls.argsFor(idx)[0]

        getBatchIndex = (idx) ->
          foo.bar.calls.argsFor(idx)[1]

        getBatchElapsed = (idx) ->
          foo.bar.calls.argsFor(idx)[2]

        expect(callsCount).toEqual(runCount);

        for idx in [0...callsCount]
          expect(getBatchElapsed(idx)).toBeLessThan(batchExecTimeLimitMilliseconds)

          batchStarted = getBatchStarted(idx)

          batchCount++ unless batchUsed[batchStarted]
          batchUsed[batchStarted] = true

        for i in [1...callsCount]
          # start time is equal for consecutive calls in a single batch
          areAdjacentBatchCalls = getBatchIndex(i - 1) < getBatchIndex(i)
          expect(getBatchStarted(i)).toEqual(getBatchStarted(i - 1)) if areAdjacentBatchCalls

        expect(batchCount).toBeGreaterThan(1)

        done()
        return

      task.run( runCount )
      return

    it 'If the second parameter to the _body setup_ function  is `false`, the _body_ gets executed only once. No `done`/`fail` handlers are called. Only `always` and `onIdle`.', (done)->
      foo = {
        bodyFunc: (resolve, reject) ->
          #resolve()
          return
      }
      spyOn(foo, 'bodyFunc').and.callThrough()

      task = new CrunchTask (init, body, fin)->
        body foo.bodyFunc, false # note the reject is never called
        return

      expect(foo.bodyFunc.calls.any()).toEqual(false)

      task.onIdle ()->
        expect(foo.bodyFunc.calls.any()).toEqual(true)
        expect(foo.bodyFunc.calls.count()).toEqual(1)
        done()
        return

      task.run()
      return

    it 'Execution of the _body function_ is timed out each time for the amount passed in the third parameter', (done)->
      foo = {
        bar: ()->
      }
      spyOn(foo, 'bar').and.callThrough()

      executionTimeout = 500

      task = new CrunchTask (init, body, fin)->
        count = 3

        init (_started) ->
          foo.bar(_started)
          return

        body (resolve, reject, notify, diag)->
          foo.bar(diag.batchStarted - 0)

          resolve() unless (--count)
          return

        , 0, executionTimeout

        return

      task.done ->
        initStarted = foo.bar.calls.argsFor(0)[0]
        bodyFirstRun = foo.bar.calls.argsFor(1)[0]
        bodySecondRun = foo.bar.calls.argsFor(2)[0]
        bodyThirdRun = foo.bar.calls.argsFor(3)[0]

        timeoutBetweenInitAndBody = Math.abs(bodyFirstRun - initStarted)
        timeoutBetweenTwoFirstBodyCalls = Math.abs(bodySecondRun - bodyFirstRun)
        timeoutBetweenTwoSecondBodyCalls = Math.abs(bodyThirdRun - bodySecondRun)

        precision = -Math.log10( 100 * 2) # +/-100ms
        expect(timeoutBetweenInitAndBody).toBeCloseTo(0, precision)
        expect(timeoutBetweenTwoFirstBodyCalls).toBeCloseTo(executionTimeout, precision)
        expect(timeoutBetweenTwoSecondBodyCalls).toBeCloseTo(executionTimeout, precision)

        done()
        return

      task.run(new Date() - 0)

      return

    it 'A task can be run several times with various parameters simultaneously. When all instances are finished the `onIdle` handler is called', (done)->
      foo = {
        taskDoneHandler: ()->
          expect(foo.onIdleHandler).not.toHaveBeenCalled()
          return
        inst1DoneHandler: ()->
          expect(foo.onIdleHandler).not.toHaveBeenCalled()
          return
        inst2DoneHandler: ()->
          expect(foo.onIdleHandler).not.toHaveBeenCalled()
          return
        inst3DoneHandler: ()->
          expect(foo.onIdleHandler).not.toHaveBeenCalled()
          return
        onIdleHandler: ()->
          return
      }

      finalExpectations = () ->
        expect(foo.onIdleHandler).toHaveBeenCalled()
        expect(foo.onIdleHandler.calls.count()).toEqual(1)

        expect(foo.taskDoneHandler).toHaveBeenCalled()
        expect(foo.inst1DoneHandler).toHaveBeenCalled()
        expect(foo.inst2DoneHandler).toHaveBeenCalled()
        expect(foo.inst3DoneHandler).toHaveBeenCalled()

        expect(foo.taskDoneHandler.calls.count()).toEqual(3)
        expect(foo.inst1DoneHandler.calls.count()).toEqual(1)
        expect(foo.inst2DoneHandler.calls.count()).toEqual(1)
        expect(foo.inst3DoneHandler.calls.count()).toEqual(1)

        expect(foo.taskDoneHandler.calls.argsFor(0)).toEqual([1, 1])
        expect(foo.taskDoneHandler.calls.argsFor(1)).toEqual([2, 4])
        expect(foo.taskDoneHandler.calls.argsFor(2)).toEqual([3, 9])

        expect(foo.inst1DoneHandler.calls.argsFor(0)).toEqual([1, 1])
        expect(foo.inst2DoneHandler.calls.argsFor(0)).toEqual([2, 4])
        expect(foo.inst3DoneHandler.calls.argsFor(0)).toEqual([3, 9])

        done()

        return


      spyOn(foo, 'taskDoneHandler').and.callThrough()
      spyOn(foo, 'inst1DoneHandler').and.callThrough()
      spyOn(foo, 'inst2DoneHandler').and.callThrough()
      spyOn(foo, 'inst3DoneHandler').and.callThrough()
      spyOn(foo, 'onIdleHandler').and.callThrough()

      task = new CrunchTask (init, body, fin)->
        variable = 0
        countdown = 2
        init (_variable) ->
          variable = _variable
          return
        body (resolve, reject) ->
          resolve(variable, variable * variable) unless countdown--
          return
        , 0
        return

#      spyOn(task, 'onIdle').and.callThrough()

      task.done foo.taskDoneHandler

      runCount = 0
      idleCount = 0
      task.onRun ()->
        runCount++
        console.log "onRun. task.id=#{task.id} runCount=#{runCount}, idleCount=#{idleCount}"
        console.log "(onRun). task.runCount=#{task.runCount}"
        return

      task.always () ->
        console.log "always. task.id=#{task.id} task.runCount=#{task.runCount}"
        return

      task.onIdle () ->
        idleCount++
        console.log "onIdle. task.id=#{task.id} runCount=#{runCount}, idleCount=#{idleCount}"
        console.log "(onIdle). task.runCount=#{task.runCount}"

        foo.onIdleHandler()
        setTimeout finalExpectations, 50
        return

      task.run(1).done foo.inst1DoneHandler
      task.run(2).done foo.inst2DoneHandler
      task.run(3).done foo.inst3DoneHandler


      return


    it 'Task instance allows to subscribe to `onRun`, and receive a call each time the task is run with the `.run(args)` method', (done) ->

      foo = {
        onRunHandler: ()->
      }

      spyOn(foo, 'onRunHandler').and.callThrough()

      task = new CrunchTask (init, body)->
        body ()->
        return

#      expect(task.onRun).not.toHaveBeenCalled()
      expect(foo.onRunHandler).not.toHaveBeenCalled()

      task.onRun foo.onRunHandler

#      expect(task.onRun).toHaveBeenCalled()
      expect(foo.onRunHandler).not.toHaveBeenCalled()

      task.run(1)
      task.run(2)

      setTimeout ()->
        expect(foo.onRunHandler).toHaveBeenCalled()
        expect(foo.onRunHandler.calls.count()).toEqual(2)
        done()

        return
      , 100

      return

    it 'When task is completed by a `resolve()`, the tasks `done` handlers are called. These handlers get subscribed to by a call to the task\'s `.done(cb)` method.', (done)->
      task = new CrunchTask (init, body)->
        body (resolve) ->
          resolve(1)
          return
        return

#      spyOn(task, 'done').and.callThrough()

      task.done (arg1, arg2, arg3) ->
        expect(arg1).toBeDefined()
        done()
        return

#      expect(task.done).toHaveBeenCalled()
      task.run()
      return

    it 'When a task completes, it always triggers `always` handlers.', (done)->

      foo = {
        onAlwaysHandler: ()->
      }

      spyOn(foo, 'onAlwaysHandler').and.callThrough()

      task = new CrunchTask ( -> ) # rejects with an error as a parameter
      task.always foo.onAlwaysHandler

      task.run()

      setTimeout ()->
        expect(foo.onAlwaysHandler).toHaveBeenCalled()
        done()
        return
      ,0

      return

    it 'A task can be chained with another task by the `then()` method, creating a new task.', ->
      result1 = new CrunchTask (init, body, fin)->
        return

      result2 = new CrunchTask (init, body, fin)->
        return

      result3 = result1.then(result2)

      expect(result3).not.toEqual(result1)
      expect(result3).not.toEqual(result2)
      expect(result3 instanceof CrunchTask).toEqual(true)
      return

    return

    it 'The third parameter to the _body_ (called `notify`) is a function that lets notify listeners of the progress of the task', (done) ->
      foo = {
        bar: () ->
      }

      spyOn(foo, 'bar').and.callThrough()

      runCycles = 3

      task = new CrunchTask (init, body, fin)->
        count = runCycles

        body (resolve, reject, notify) ->
          notify 'const', count
          do resolve unless --count
          return
        return

      task.progress foo.bar

      expect(foo.bar).not.toHaveBeenCalled()

      task.run()

      task.always ()->
        expect(foo.bar).toHaveBeenCalled()

        expect(foo.bar.calls.count()).toEqual(runCycles)

        expect(foo.bar.calls.argsFor(0)).toEqual(['const', runCycles])
        expect(foo.bar.calls.argsFor(runCycles - 1)).toEqual(['const', 1])
        done()
        return

      return

    it 'The run-instance of a task, based on the Promise object, has the `.abort()` method to abort execution of this instance alone', (done)->
      memo = {}
      foo = {
        bar: ((id) ->
          memo[id] = (memo[id] || 0) + 1
        )
      }
      spyOn(foo, 'bar').and.callThrough();

      timeoutAmount = 100
      safetyMargin = Math.floor(timeoutAmount / 2)

      task = new CrunchTask (init, body, fin)->
        id = null
        init (_id)->
          id = _id
          return
        body ->
          foo.bar(id) # never resolves!
          return
        ,0, timeoutAmount
        return

      task.always ->
        expect(foo.bar).toHaveBeenCalled()
        return

      expect(foo.bar).not.toHaveBeenCalled()

      result1 = task.run(1)
      result2 = task.run(2)

      setTimeout ->
        expect(foo.bar.calls.count()).toEqual(2)
        expect(memo[1]).toEqual(1)
        expect(memo[2]).toEqual(1)
        result1.abort()
        return
      , (timeoutAmount + safetyMargin)

      setTimeout ->
        expect(foo.bar.calls.count()).toEqual(3)
        expect(memo[1]).toEqual(1)
        expect(memo[2]).toEqual(2)
        result1.resume()
        return
      , (2 * timeoutAmount + safetyMargin)

      setTimeout ->
        expect(foo.bar.calls.count()).toEqual(4)
        expect(memo[1]).toEqual(1)
        expect(memo[2]).toEqual(3)
        task.abort()
        return
      , (3 * timeoutAmount + safetyMargin)

      setTimeout ->
        done()
        return
      , (4 * timeoutAmount + safetyMargin)

      return


    it 'When the task\'s `.abort()` method is called, the execution of all instances being run is aborted', (done)->
      foo = {
        bar: () ->
      }
      spyOn(foo, 'bar').and.callThrough()

      task = new CrunchTask (init, body, fin)->
        body foo.bar
        return

      expect(foo.bar).not.toHaveBeenCalled()

      task.always ()->
        # called twice !
        expect(foo.bar).not.toHaveBeenCalled()
        return

      result1 = task.run();
      result2 = task.run();
      task.abort()

      setTimeout done, 100
      return

    it 'The `.pause()`/`.resume()` method pair on run-instances are called to pause/resume the execution of a single run-instance', (done)->
      memo = {}
      foo = {
        bar: ((id) ->
          memo[id] = (memo[id] || 0) + 1
        )
      }
      spyOn(foo, 'bar').and.callThrough()

      timeoutAmount = 100
      safetyMargin = Math.floor(timeoutAmount / 2)

      task = new CrunchTask (init, body, fin)->
        id = null
        init (_id)->
          id = _id
          return

        body ->
          foo.bar(id)
          return
        ,0, timeoutAmount
        return

      task.always ->
        expect(foo.bar).toHaveBeenCalled()
        return

      expect(foo.bar).not.toHaveBeenCalled()

      result1 = task.run(1)
      result2 = task.run(2)

      setTimeout ->
        expect(foo.bar.calls.count()).toEqual(2)
        expect(memo[1]).toEqual(1)
        expect(memo[2]).toEqual(1)
        result1.pause()
        return
      , timeoutAmount + safetyMargin

      setTimeout ->
        expect(foo.bar.calls.count()).toEqual(3)
        expect(memo[1]).toEqual(1)
        expect(memo[2]).toEqual(2)
        result1.resume()
        return
      , 2 * timeoutAmount + safetyMargin

      setTimeout ->
        expect(foo.bar.calls.count()).toEqual(5)
        expect(memo[1]).toEqual(2)
        expect(memo[2]).toEqual(3)
        task.abort()
        return
      , 3 * timeoutAmount + safetyMargin

      setTimeout ->
        done()
        return
      , 4 * timeoutAmount + safetyMargin

      return


    it 'The `.pause()`/`.resume()` method pair on a task is used to pause/resume the execution of all run-instances together', (done)->
      foo = {
        bar: () ->
      }
      spyOn(foo, 'bar').and.callThrough()

      timeoutAmount = 100
      safetyMargin = Math.floor(timeoutAmount / 2)

      task = new CrunchTask (init, body, fin)->
        body foo.bar, 0, timeoutAmount
        return

      expect(foo.bar).not.toHaveBeenCalled()

      task.always ()->
        expect(foo.bar).toHaveBeenCalled()

      result1 = task.run()
      result2 = task.run()

      setTimeout ->
        expect(foo.bar.calls.count()).toEqual(2 * 1)
        task.pause()
        return
      , timeoutAmount + safetyMargin

      setTimeout ->
        expect(foo.bar.calls.count()).toEqual(2 * 1)
        task.resume()
        return
      , 2 * timeoutAmount + safetyMargin

      setTimeout ->
        expect(foo.bar.calls.count()).toEqual(2 * 2)
        task.abort()
        return
      , 3 * timeoutAmount + safetyMargin

      setTimeout ->
        done()
        return
      , 4 * timeoutAmount + safetyMargin

      return

    it 'When all run-instances are finished, the `idle` handlers are called. These get subscribed by the task\'s `.onIdle()` method. The `.isIdle()` method allows checking whether all run-instances are stopped.', (done)->

      task = new CrunchTask (init, body, fin)->
        body (resolve)->
          resolve()
          return
        return

      task.onIdle ()->
        debugger
        expect(task.isIdle()).toBe(true)
        done()
        return

      expect(task.isIdle()).toBe(true)
      task.run()
      expect(task.isIdle()).toBe(false)
      task.run()
      expect(task.isIdle()).toBe(false)

      return

    return


  describe 'Examples in the readme.md file. Collatz Task', ->
    collatzTask = null
    beforeEach ()->
      collatzTask = new CrunchTask (init, body, fin) ->
        nInit = null
        n  = null
        threshold = null
        totalStoppingTime = 0

        init (_n, _threshold) ->
          nInit = n = _n
          threshold = _threshold
          return

        body (resolve, reject) ->
          return resolve(nInit, totalStoppingTime) if n is 1
          return reject(nInit, threshold, n) if n > threshold
          if (n % 2)
            n = 3 * n + 1
          else
            n = n / 2
          totalStoppingTime++
          return
        , 100

        fin (status)->
          console.log "Collatz conjecture breaking candidate: #{nInit}" unless status
          return
        return
      return

    afterEach ()->
      collatzTask.abort() if collatzTask
      collatzTask = null
      return

    it 'implements a Collatz conjecture, aka 3n + 1 problem, algorithm', (ddone)->

      collatzTask.onIdle ddone

      collatzTask.run(1).done (n, count)->
        expect(n).toEqual(1)
        expect(count).toEqual(0)
        return

      collatzTask.run(6).done (n, count)->
        expect(n).toEqual(6)
        expect(count).toEqual(8)
        return

      collatzTask.run(63728127).done (n, count)->
        expect(n).toEqual(63728127)
        expect(count).toEqual(949)
        return

      for v, k in [0, 1, 7, 2, 5, 8, 16, 3, 19, 6, 14, 9, 9, 17, 17, 4, 12, 20, 20, 7, 7, 15, 15, 10, 23, 10, 111, 18, 18, 18, 106, 5, 26, 13, 13, 21, 21, 21, 34, 8, 109, 8, 29, 16, 16, 16, 104, 11, 24, 24]
        ((v, k) ->
          collatzTask.run(k + 1).done (n, count)->
            expect(n).toEqual(k + 1)
            expect(count).toEqual(v)
            return
          return
        )(v, k)

      return

    return

  return
