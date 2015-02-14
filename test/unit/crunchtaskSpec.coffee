#http://jasmine.github.io/edge/introduction.html
#http://coffeescript.org/
describe 'TaskCruncher Spec: ', ->

  it 'Use Jasmine with Version 2.xx', ->
    expect(jasmine.version).toMatch(/^2\./);
    return

  type = do ->
    classToType = {}
    for prop in 'Boolean Number String Function Array Date RegExp Object'.split(' ')
      do (prop) ->
        classToType["[object #{prop}]"] = prop.toLowerCase()
    (obj) ->
      if obj == undefined or obj == null
        return String obj
      return classToType[Object::toString.call(obj)]

  describe 'Declaration: ', ->
    it 'declares a type CrunchTask on the global scope', ->
      expect(CrunchTask).toBeDefined()
      return
    return

  describe 'Instantiation: ', ->

    it 'create instances of CrunchTask class by a function call', ->
      result = CrunchTask(() ->)
      expect(result instanceof CrunchTask).toEqual(true)
      return

    it '.. or by a `new` keyword instantiation', ->
      result = new CrunchTask(()->)
      expect(result instanceof CrunchTask).toEqual(true)
      return

    it 'required is the only argument, a task description function', ->
      expect(()->
        new CrunchTask(()->)
      ).not.toThrow()
      return

    it 'throws Error if required parameter is not passed', ->
      expect(()->
        CrunchTask()
      ).toThrow()

      expect(()->
        CrunchTask(1, 2, 3)
      ).toThrow()
      return

    return

  describe 'API. CrunchTask instance..', ->
    task = null

    beforeEach ->
      task = new CrunchTask (init, body, fin)->
        return

    it 'has an `id` property, a unique task identifier, of type Number', ->
      expect(task.id).toBeDefined()
      expect(type(task.id)).toEqual('number')
      return

    it 'has a `timestamp` property, a timestamp when the task was created, of type Number', ->
      expect(task.timestamp).toBeDefined()
      expect(type(task.timestamp)).toEqual('number')
      expect(Math.abs(new Date() - task.timestamp) < 1000).toBe(true)
      return

    it 'declares `run()` method', ->
      expect(task.run).toBeDefined()
      expect(type(task.run)).toEqual('function')
      return

    it 'declares `then()` method', ->
      expect(task.then).toBeDefined()
      expect(type(task.then)).toEqual('function')
      return

    it 'declares `onRun()` method', ->
      expect(task.onRun).toBeDefined()
      expect(type(task.onRun)).toEqual('function')
      return

    it 'declares `onIdle()` method', ->
      expect(task.onIdle).toBeDefined()
      expect(type(task.onIdle)).toEqual('function')
      return

    it 'declares `done()` method', ->
      expect(task.done).toBeDefined()
      expect(type(task.done)).toEqual('function')
      return

    it 'declares `fail()` method', ->
      expect(task.fail).toBeDefined()
      expect(type(task.fail)).toEqual('function')
      return

    it 'declares `always()` method', ->
      expect(task.always).toBeDefined()
      expect(type(task.always)).toEqual('function')
      return

    it 'declares `progress()` method', ->
      expect(task.progress).toBeDefined()
      expect(type(task.progress)).toEqual('function')
      return

    it 'declares `abort()` method', ->
      expect(task.abort).toBeDefined()
      expect(type(task.abort)).toEqual('function')
      return

    it 'declares `pause()` method', ->
      expect(task.pause).toBeDefined()
      expect(type(task.pause)).toEqual('function')
      return

    it 'declares `resume()` method', ->
      expect(task.resume).toBeDefined()
      expect(type(task.resume)).toEqual('function')
      return

    it 'declares `isIdle():{Boolean}` method', ->
      expect(task.isIdle).toBeDefined()
      expect(type(task.isIdle)).toEqual('function')
      return

    it 'returns a promise object when `run(args..):{Promise}` is called', ->
      result = task.run()
      expect(result).toBeDefined()
      expect(result instanceof Promise).toEqual(true)
      return

    it 'rejects the run when no `body` is supplied', (done)->
      foo = {
        bar: ()->
      }

      spyOn(foo, 'bar').and.callThrough()

      task = new CrunchTask (init, body, fin)->

      task.fail foo.bar

      expect(foo.bar.calls.any()).toEqual(false)
      task.run()

      window.setTimeout(() ->
          expect(foo.bar.calls.any()).toEqual(true)
          expect(foo.bar.calls.argsFor(0)[0] instanceof Error).toEqual(true);
          done()
      , 1000)
      return

    return

    describe 'some instance methods can be chained', ()->
      task = null

      beforeEach ->
        task = new CrunchTask (init, body, fin)->
          return

      it 'all task\'s methods can be invoked on the result of `onRun():{CrunchTask}` method', ->
        expect(task.onRun(()->) instanceof CrunchTask).toBe(true)
        return

      it 'all task\'s methods can be invoked on the result of `onIdle():{CrunchTask}` method', ->
        expect(task.onIdle(()->) instanceof CrunchTask).toBe(true)
        return

      it 'all task\'s methods can be invoked on the result of `done():{CrunchTask}` method', ->
        expect(task.done(()->) instanceof CrunchTask).toBe(true)
        return

      it 'all task\'s methods can be invoked on the result of `fail():{CrunchTask}` method', ->
        expect(task.fail(()->) instanceof CrunchTask).toBe(true)
        return

      it 'all task\'s methods can be invoked on the result of `always():{CrunchTask}` method', ->
        expect(task.always(()->) instanceof CrunchTask).toBe(true)
        return

      it 'all task\'s methods can be invoked on the result of `progress():{CrunchTask}` method', ->
        expect(task.progress(()->) instanceof CrunchTask).toBe(true)
        return

      it 'all task\'s methods can be invoked on the result of `abort():{CrunchTask}` method', ->
        expect(task.abort(()->) instanceof CrunchTask).toBe(true)
        return

      it 'all task\'s methods can be invoked on the result of `pause():{CrunchTask}` method', ->
        expect(task.pause(()->) instanceof CrunchTask).toBe(true)
        return

      it 'all task\'s methods can be invoked on the result of `resume():{CrunchTask}` method', ->
        expect(task.resume(()->) instanceof CrunchTask).toBe(true)
        return

      return

    describe 'the `promise` object obtained by `run()` has three extra methods:', ()->
      runResult = null

      beforeEach(()->
        runResult = task.run()
      )

      afterEach(()->
        runResult = null
      )

      it 'declares `abort()` method', ()->
        expect(runResult.abort).toBeDefined()
        expect(type(runResult.abort)).toEqual('function')
        return

      it 'declares `pause()` method', ()->
        expect(runResult.pause).toBeDefined()
        expect(type(runResult.pause)).toEqual('function')
        return

      it 'declares `resume()` method', ()->
        expect(runResult.resume).toBeDefined()
        expect(type(runResult.resume)).toEqual('function')
        return

      return

    describe 'Convenience static method `for`', ->

      it 'declares static deprecated `for()` method', ()->
        expect(CrunchTask.for).toBeDefined()
        expect(type(CrunchTask.for)).toEqual('function')
        return

      it 'declares static `range()` method (supercedes `for()`)', ()->
        expect(CrunchTask.range).toBeDefined()
        expect(type(CrunchTask.range)).toEqual('function')
        return

      it 'declares static `rangeCheck()` method', ()->
        expect(CrunchTask.rangeCheck).toBeDefined()
        expect(type(CrunchTask.rangeCheck)).toEqual('function')
        return

      it 'declares static `rangeNextAndCheck` method', ()->
        expect(CrunchTask.rangeNextAndCheck).toBeDefined()
        expect(type(CrunchTask.rangeNextAndCheck)).toEqual('function')
        return

      describe '`rangeCheck()` method parses the arguments into async-for-loop-ready structure', ()->
        it 'no arguments produces empty ranges array and is OK', ()->
          expect(CrunchTask.rangeCheck()).toEqual([])
          return
        it 'only numerics, bools, and arrays are considered as args', ()->
          `var undef;`
          expect(CrunchTask.rangeCheck('123', undef, /123/)).toEqual([])
          return
        it 'a valid range is represented by the array of 3 numbers and an `inclusive` flag', ()->
          expect(CrunchTask.rangeCheck(0, 9, .5, true)).toEqual([
            {
              from: 0,
              current: 0,
              to: 9,
              step: .5,
              inclusive: true
            } ])
          return
        it 'the first number represents a range\'s `from` value', ()->
          from = 5
          expect(CrunchTask.rangeCheck(from, 9, .5, true)[0].from).toEqual(from)
          from = -5
          expect(CrunchTask.rangeCheck(from, 9, .5, true)[0].from).toEqual(from)
          return
        it 'the second number represents a range\'s `to` value', ()->
          to = 5
          expect(CrunchTask.rangeCheck(5, to, .5, true)[0].to).toEqual(to)
          to = -5
          expect(CrunchTask.rangeCheck(5, to, .5, true)[0].to).toEqual(to)
          return
        it 'the third number represents a `step` value ', ()->
          step = 5
          expect(CrunchTask.rangeCheck(0, 9, step, true)[0].step).toEqual(step)
          step = -5
          expect(CrunchTask.rangeCheck(0, 9, step, true)[0].step).toEqual(step)
          step = .5
          expect(CrunchTask.rangeCheck(0, 9, step, true)[0].step).toEqual(step)
          return
        it 'if the `step` is omitted, it defaults to +1 if (`from` <= `to`), and -1 otherwise', ()->
          from = 0
          to = 10
          expect(CrunchTask.rangeCheck(from, to)[0].step).toEqual(+1)
          from = 10
          to = 10
          expect(CrunchTask.rangeCheck(from, to)[0].step).toEqual(+1)
          from = 10
          to = 0
          expect(CrunchTask.rangeCheck(from, to)[0].step).toEqual(-1)
          from = 0
          to = 10
          expect(CrunchTask.rangeCheck(from, to, false)[0].step).toEqual(+1)
          from = 10
          to = 10
          expect(CrunchTask.rangeCheck(from, to, false)[0].step).toEqual(+1)
          from = 10
          to = 0
          expect(CrunchTask.rangeCheck(from, to, false)[0].step).toEqual(-1)
          return
        it 'if the `inclusive` is omitted, it defaults to `false`', ()->
          expect(CrunchTask.rangeCheck(0, 9)[0].inclusive).toEqual(false);
          expect(CrunchTask.rangeCheck(0, 9, .5)[0].inclusive).toEqual(false);
          return
        it 'so the minimum of two numbers define a range `0,10` mean `from 0 to 10`', ()->
          expect(()->
            CrunchTask.rangeCheck(0, 9)
          ).not.toThrow()
          return
        it 'less than 2 numeric arguments do not represent a valid range and an error is thrown', ()->
          expect(()->
            CrunchTask.rangeCheck(0)
          ).toThrow()

          expect(()->
            CrunchTask.rangeCheck(0,true)
          ).toThrow()
          return
        it 'two or more ranges can be defined in a flat list if `inclusive` flag is supplied for each', ()->
          expect(()->
            CrunchTask.rangeCheck(0, 9, 1, true, 9, 0, -1, true)
            CrunchTask.rangeCheck(0, 9, 1, true, 9, 0, -1, true, 5, 1, false)
          ).not.toThrow()

          expect(CrunchTask.rangeCheck(0, 9, 1, true, 9, 0, -1, true)
          ).toEqual([
                { from: 0, current: 0, to: 9, step: 1, inclusive: true },
                { from: 9, current: 9, to: 0, step: -1, inclusive: true } ])

          expect(CrunchTask.rangeCheck(0, 9, 1, true, 9, 0, -1, true, 5, 1, false)
          ).toEqual([
                { from: 0, current: 0, to: 9, step: 1, inclusive: true },
                { from: 9, current: 9, to: 0, step: -1, inclusive: true },
                { from: 5, current: 5, to: 1, step: -1, inclusive: false } ])
          return
        it 'this way, the bools serve as comma. Thus the last bool can be omitted if need be', ()->
          expect(()->
            CrunchTask.rangeCheck(0, 9, 1, true, 9, 0, -1, true, 5, 1)
          ).not.toThrow()

          expect(CrunchTask.rangeCheck(0, 9, 1, true, 9, 0, -1, true, 5, 1)
          ).toEqual([
                { from: 0, current: 0, to: 9, step: 1, inclusive: true },
                { from: 9, current: 9, to: 0, step: -1, inclusive: true },
                { from: 5, current: 5, to: 1, step: -1, inclusive: false } ])
          return
        it 'however, this cannot be done safely for mid-list bools, they are obligatory', ()->
          expect(()->
            CrunchTask.rangeCheck(0, 9, 1, 9, 0, -1)
          ).toThrow()
          expect(()->
            CrunchTask.rangeCheck(0, 9, 1, 9, 0, -1, 5, 1)
          ).toThrow()
          expect(()->
            CrunchTask.rangeCheck(0, 9, 1, 9)
          ).toThrow()
          return
        it 'it can be advised to use arrays to group individual ranges', ()->
          expect(()->
            CrunchTask.rangeCheck([0, 9], [1, 9])
          ).not.toThrow()
          return
        it 'the same rules apply to these individual array as for the flat list args described above. Nested arrays are ignored, though', ()->
          expect(()->
            CrunchTask.rangeCheck([0, 9, [1, 9]])
          ).not.toThrow()
          expect(CrunchTask.rangeCheck([0, 9, [1, 9]])
          ).toEqual([
                { from: 0, current: 0, to: 9, step: 1, inclusive: false } ])
          return
        it 'arrays can be mixed with the valid ranges chains with expected valid results', ()->
          result = null
          expect(()->
            result = CrunchTask.rangeCheck([0, 9], 9, 0, -.5, false, 9, 0, -.5, [1, 9, true], 9, 0, -.5, false,[0,5])
          ).not.toThrow()
          expect(result).toEqual([
            { from: 0, current: 0, to: 9, step: 1, inclusive: false },
            { from: 9, current: 9, to: 0, step: -0.5, inclusive: false },
            { from: 9, current: 9, to: 0, step: -0.5, inclusive: false },
            { from: 1, current: 1, to: 9, step: 1, inclusive: true },
            { from: 9, current: 9, to: 0, step: -0.5, inclusive: false },
            { from: 0, current: 0, to: 5, step: 1, inclusive: false } ])
          return
        it 'ranges can be used to imitate binary permutation', ()->
          expect(CrunchTask.rangeCheck(0, 1, true, 0, 1, true, 0, 1, true)
          ).toEqual([
                { from: 0, current: 0, to: 1, step: 1, inclusive: true },
                { from: 0, current: 0, to: 1, step: 1, inclusive: true },
                { from: 0, current: 0, to: 1, step: 1, inclusive: true } ])
          return
        return

      describe '`rangeNextAndCheck()` method tries to advance the current position of the ranges structure', ()->
        range = null;

        beforeEach(()->
          range = CrunchTask.rangeCheck(0, 1, true)
        )

        it 'advances the elements of the range structure and responds whether it has not reached the end yet (hasn\'t looped over)', ()->
          expect(CrunchTask.rangeNextAndCheck(range)).toBe(true)
          return
        it 'inclusive range of [0..1] reaches the end in two calls.', ()->
          expect(CrunchTask.rangeNextAndCheck(range)).toBe(true)
          expect(CrunchTask.rangeNextAndCheck(range)).toBe(false)
          return
        it 'so does the inclusive range of [1..0]', ()->
          range = CrunchTask.rangeCheck(1, 0, true)
          expect(CrunchTask.rangeNextAndCheck(range)).toBe(true)
          expect(CrunchTask.rangeNextAndCheck(range)).toBe(false)
          return
        it 'non-inclusive range of [0..1) reaches end with each call', ()->
          range = CrunchTask.rangeCheck(0, 1)
          expect(CrunchTask.rangeNextAndCheck(range)).toBe(false)
          return
        it 'a non-inclusive range of [0..1) with step .5 reaches end with two calls', ()->
          range = CrunchTask.rangeCheck(0, 1, .5)
          expect(CrunchTask.rangeNextAndCheck(range)).toBe(true)
          expect(CrunchTask.rangeNextAndCheck(range)).toBe(false)
          return
        it 'so does the reverse range of [1..0) with step -.5', ()->
          range = CrunchTask.rangeCheck(1, 0, -.5)
          expect(CrunchTask.rangeNextAndCheck(range)).toBe(true)
          expect(CrunchTask.rangeNextAndCheck(range)).toBe(false)
          return
        it 'it takes four iterations to iterate fully two binary ranges [0..1]&[0..1]', ()->
          range = CrunchTask.rangeCheck(0, 1, true, 0, 1, true)
          expect(CrunchTask.rangeNextAndCheck(range)).toBe(true)
          expect(CrunchTask.rangeNextAndCheck(range)).toBe(true)
          expect(CrunchTask.rangeNextAndCheck(range)).toBe(true)
          expect(CrunchTask.rangeNextAndCheck(range)).toBe(false)
          return

        return

      describe 'the `for()` method', ()->
        foo = {}

        beforeEach(()->
          foo.bar = (() ->
          )
        )

        it 'once called, the `for()` method creates a CrunchTask instance', ()->
          forLoop = CrunchTask.for(()->)
          expect(forLoop instanceof CrunchTask).toBe(true);
          return

        it 'the `for()` method accepts loop control numbers and a worker function (or two functions: body and tail) or a task', (done)->

          spyOn(foo, 'bar').and.callThrough()

          forLoop = CrunchTask.for(0, 2, foo.bar)

          expect(foo.bar).not.toHaveBeenCalled()

          forLoop.run()

          setTimeout(()->
            expect(foo.bar).toHaveBeenCalled()
            expect(foo.bar.calls.count()).toEqual(2)
            expect(foo.bar.calls.argsFor(0)).toEqual([0])
            done()
          , 10)

          return

        it 'the loop control values, supplied for the `for()` method, are overrun by the ones supplied for the `run()` method', (done)->

          spyOn(foo, 'bar').and.callThrough()

          forLoop = CrunchTask.for(0, 2, foo.bar)

          expect(foo.bar).not.toHaveBeenCalled()

          forLoop.run(0, 5)

          setTimeout(()->
            expect(foo.bar).toHaveBeenCalled()
            expect(foo.bar.calls.count()).toEqual(5)
            expect(foo.bar.calls.argsFor(0)).toEqual([0])
            expect(foo.bar.calls.argsFor(1)).toEqual([1])
            expect(foo.bar.calls.argsFor(2)).toEqual([2])
            expect(foo.bar.calls.argsFor(3)).toEqual([3])
            expect(foo.bar.calls.argsFor(4)).toEqual([4])
            done()
          , 10)

          return

        it 'loop-control values may be supplied in groups, their behavior is explained in the `rangeCheck()` section above', (done)->

          spyOn(foo, 'bar').and.callThrough()

          forLoop = CrunchTask.for([0, 2], [0, 2], foo.bar)

          expect(foo.bar).not.toHaveBeenCalled()

          forLoop.done( ()->
            expect(foo.bar).toHaveBeenCalled()
            expect(foo.bar.calls.count()).toEqual(4)
            expect(foo.bar.calls.argsFor(0)).toEqual([0, 0])
            expect(foo.bar.calls.argsFor(1)).toEqual([1, 0])
            expect(foo.bar.calls.argsFor(2)).toEqual([0, 1])
            expect(foo.bar.calls.argsFor(3)).toEqual([1, 1])
            done()
          )

          forLoop.run()
          return

        it 'loop-control values in the group may initiate a countdown loop..', (done)->

          spyOn(foo, 'bar').and.callThrough()

          forLoop = CrunchTask.for([1, -1], [1, -1], foo.bar)

          expect(foo.bar).not.toHaveBeenCalled()

          forLoop.done( ()->
            expect(foo.bar).toHaveBeenCalled()
            expect(foo.bar.calls.count()).toEqual(4)
            expect(foo.bar.calls.argsFor(0)).toEqual([1, 1])
            expect(foo.bar.calls.argsFor(1)).toEqual([0, 1])
            expect(foo.bar.calls.argsFor(2)).toEqual([1, 0])
            expect(foo.bar.calls.argsFor(3)).toEqual([0, 0])
            done()
          )

          forLoop.run()
          return

        it 'if no function is supplied, the loop resolves automatically when started', (done)->
          spyOn(foo, 'bar')
          forLoop = CrunchTask.for()
          forLoop.done(foo.bar)

          expect(foo.bar.calls.any()).toEqual(false)

          forLoop.run()

          setTimeout(()->
            expect(foo.bar.calls.any()).toEqual(true)
            done()
          , 10)
          return

        return

      return


  describe 'Usage Patterns: ', ->
    task = null

    beforeEach () ->
      task = new CrunchTask (init, body, fin)->
        return

    it 'uses a simple construction function', ->
      result = new CrunchTask (init, body, fin)->
        expect(true).toEqual(true)
      result.run()

    it '..which expects the tree arguments (`init, body, fin`) to be functions', (done) ->
      result = new CrunchTask (init, body, fin)->
        expect(init).toBeDefined()
        expect(type(init)).toEqual('function')
        expect(body).toBeDefined()
        expect(type(body)).toEqual('function')
        expect(fin).toBeDefined()
        expect(type(fin)).toEqual('function')
        done()
        return
      result.run()

    it 'uses `init` function to inject runtime values into execution scope. Sample 1 - Empty', (done) ->
      result = new CrunchTask (init, body, fin)->
        init((arg1)->
          expect(arg1).not.toBeDefined()
          done()
        )
        return
      result.run()

    it 'uses `init` function to inject runtime values into execution scope. Sample 2 - One arg', (done) ->
      result = new CrunchTask (init, body, fin)->
        init((arg1)->
          expect(arg1).toBeDefined()
          expect(arg1).toEqual(123)
          done()
        )
        body(()->
          throw new Error('stop'))
        return
      result.run(123)

    it 'uses `init` function to inject runtime values into execution scope. Sample 3 - Few args', (done) ->
      result = new CrunchTask (init, body, fin)->
        init((arg1, arg2)->
          expect(arg1).toBeDefined()
          expect(arg1).toEqual(123)
          expect(arg2).toBeDefined()
          expect(arg2).toEqual('456')
          done()
        )
        body(()->
          throw new Error('stop'))
        return
      result.run(123, '456')

    it 'allows `body` function to operate on values injected with `init`', (done)->
      task = new CrunchTask (init, body, fin)->
        result = null
        init((arg1)->
          result = arg1
        )
        body(()->
          expect(result).toBeDefined()
          expect(result).toEqual(123)
          done()
          throw new Error('stop')
        )
        return
      task.run(123)

#    xit 'uses `body` function to describe main logic and control its flow with three c/backs'

    it 'uses `body` to control flow with two c/backs (`resolve, reject`). Sample - resolve', (done) ->
      task = new CrunchTask (init, body, fin)->
        body((resolve, reject, notify)->
          resolve(123)
        )
        return
      task.run().then(
        ((arg) ->
          expect(arg).toEqual([123])
          done()
          return),
        () -> return
      )

    it 'uses `body` to control flow with two c/backs (`resolve, reject`). Sample - reject', (done) ->
      task = new CrunchTask (init, body, fin)->
        body((resolve, reject, notify)->
          reject(123)
        )
        return
      task.run().then(
        () -> return,
        ((arg) ->
          expect(arg).toEqual([123])
          done()
          return)
      )

    it 'executes only once, when the second parameter to the `body` callback is `false`', (done)->
      foo = {
        bar: (resolve, reject) ->
      }

      setTimeout(done, 5000)

      spyOn(foo, 'bar').and.callThrough()

      task = new CrunchTask((init, body, fin)->
        body(foo.bar, false)
        fin(done)
        return
      )

      task.always(()->
        expect(foo.bar.calls.any()).toEqual(true)
        expect(foo.bar.calls.count()).toEqual(1)
        done()
      )

      expect(foo.bar.calls.any()).toEqual(false)
      task.run()

    it 'packs execution of the `body` c/back under the amount of passed ms, if possible', (done)->

      foo = {
        bar: (() ->
        )
      }
      spyOn(foo, 'bar').and.callThrough()

      batchExecTimeLimitMilliseconds = 100

      task = new CrunchTask((init, body, fin)->
        count = 250
        started = 0
        init((_started) -> started = _started)
        body((resolve, reject, notify, diag)->
          foo.bar(diag.batchStarted - 0, diag.batchIndex, diag.batchElapsed)
          if (!(--count))
            resolve()

        , batchExecTimeLimitMilliseconds)
        return
      )

      task.always(()->
        expect(foo.bar.calls.count()).toEqual(250);
        for i in [0...foo.bar.calls.count()]
          expect(foo.bar.calls.argsFor(i)[2]).toBeLessThan(batchExecTimeLimitMilliseconds)
        for i in [1...foo.bar.calls.count()]
          expect(foo.bar.calls.argsFor(i)[0]).toEqual(foo.bar.calls.argsFor(i - 1)[0]) if foo.bar.calls.argsFor(i)[1] > foo.bar.calls.argsFor(i - 1)[1]

        done()
      )

      task.run((new Date() - 0))

    it 'spaces execution of the `body` c/back for the amount passed in the third parameter', (done)->
      foo = {
        bar: (() ->
        )
      }
      spyOn(foo, 'bar').and.callThrough()
      executionTimeout = 500
      task = new CrunchTask((init, body, fin)->
        count = 2
        started = 0
        init((_started) -> started = _started)
        body((resolve, reject, notify, diag)->
          foo.bar(diag.batchStarted)
          if (!(count--))
            resolve()
        , 0, executionTimeout)
        return
      )
      started = new Date() - 0
      task.done ->
        expect(Math.abs( started - foo.bar.calls.argsFor(0)[0])).toBeGreaterThan(executionTimeout - 1)
        expect(Math.abs( foo.bar.calls.argsFor(0)[0] - foo.bar.calls.argsFor(1)[0])).toBeGreaterThan(executionTimeout - 1)
        done()
      task.run()

    it 'wraps all arguments into an array for Promise endpoints, unwraps for own handlers. Sample - resolve', (done) ->
      task = new CrunchTask (init, body, fin)->
        body((resolve, reject, notify)->
          resolve(123)
        )
        return
      task.done(
        (arg) ->
          expect(arg).toEqual(123)
          done()
          return
      )
      task.run()

    it 'wraps all arguments into an array for Promise endpoints, unwraps for own handlers. Sample - reject', (done) ->
      task = new CrunchTask (init, body, fin)->
        body((resolve, reject, notify)->
          reject(123)
        )
        return
      task.fail(
        (arg) ->
          expect(arg).toEqual(123)
          done()
          return
      )
      task.run()

    it 'allows to subscribe to `onRun` handler', ->
      spyOn(task, 'onRun').and.callThrough()

      task.onRun(
        (arg1, arg2, arg3) ->
          return)

      expect(task.onRun).toHaveBeenCalled();
#      do done

    it 'triggers `onRun` handlers when `run()` is called', (done)->
      task.onRun(
        (arg1, arg2, arg3) ->
          do done)
      task.run()

    it 'allows to subscribe to completion `done` handler', ->
      spyOn(task, 'done').and.callThrough()
      task.done(
        (arg1, arg2, arg3) ->
          return)

      expect(task.done).toHaveBeenCalled();

    it 'always triggers `always` handlers when completion is reached', (done)->
      task = new CrunchTask ( -> )
      task.always(
        (arg1, arg2, arg3) ->
          expect(arg1).toBeDefined()
          do done
      )
      task.run()
      return

    it 'can be chained with the `then()` method creating a new task', ->
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

  describe 'close-to-real usage examples', ->
    originalTimeout = null
    originalTimeout = jasmine.getEnv().defaultTimeoutInterval || jasmine.DEFAULT_TIMEOUT_INTERVAL
    #      jasmine.getEnv().defaultTimeoutInterval = 100000
    #      jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000

    beforeEach (done) ->
      originalTimeout = jasmine.getEnv().defaultTimeoutInterval || jasmine.DEFAULT_TIMEOUT_INTERVAL
      #        jasmine.getEnv().defaultTimeoutInterval = 100000
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000
      done()
      return

    afterEach () ->
      jasmine.getEnv().defaultTimeoutInterval = originalTimeout
      jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout
      return

    it 'uses `body`/`notify` c/back to notify listeners of the progress of the task', ((done) ->
      foo = {
        bar: (() ->
        )
      }

      spyOn(foo, 'bar').and.callThrough();

      runCycles = 3

      task = new CrunchTask (init, body, fin)->
        count = runCycles
        body((resolve, reject, notify)->
          notify('const', count--)
          if !count
            resolve()
          return
        )
        return

      task.progress(foo.bar)

      expect(foo.bar.calls.any()).toEqual(false)

      task.run()

      task.always(()->
        expect(foo.bar.calls.any()).toEqual(true)
        expect(foo.bar.calls.count()).toEqual(runCycles)
        expect(foo.bar.calls.argsFor(0)).toEqual(['const', runCycles])
        expect(foo.bar.calls.argsFor(runCycles - 1)).toEqual(['const', 1])
        done()
        return
      )
      return
    )

    it 'uses `abort` method called on `run` result to abort execution of a run-instance', (done)->
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
        body ->
          foo.bar(id)
        ,0, timeoutAmount

      task.always ->
        expect(foo.bar.calls.any()).toEqual(true)

      expect(foo.bar.calls.any()).toEqual(false)

      result1 = task.run(1)
      result2 = task.run(2)

      setTimeout ->
        expect(foo.bar.calls.count()).toEqual(2)
        expect(memo[1]).toEqual(1)
        expect(memo[2]).toEqual(1)
        result1.abort()
      , timeoutAmount + safetyMargin

      setTimeout ->
        expect(foo.bar.calls.count()).toEqual(3)
        expect(memo[1]).toEqual(1)
        expect(memo[2]).toEqual(2)
        result1.resume()
      , 2 * timeoutAmount + safetyMargin

      setTimeout ->
        expect(foo.bar.calls.count()).toEqual(4)
        expect(memo[1]).toEqual(1)
        expect(memo[2]).toEqual(3)
        task.abort()
      , 3 * timeoutAmount + safetyMargin

      setTimeout ->
        done()
      , 4 * timeoutAmount + safetyMargin
      return


    it 'uses `abort` method called on task to abort execution of all run-instances', (done)->
      moo = {
        id: 1,
        bar: () ->
      }
      spyOn(moo, 'bar').and.callThrough()

      task = new CrunchTask (init, body, fin)->
        body moo.bar

      expect(moo.bar.calls.any()).toEqual(false)

      task.always ()->
        # called twice !
        expect(moo.bar.calls.any()).toEqual(false)

      result1 = task.run();
      result2 = task.run();
      task.abort()

      window.setTimeout done, 100
      return


    it 'uses `pause`/`resume` method pair called on `run` result to pause/resume the execution of a single thread', (done)->
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
        body ->
          foo.bar(id)
        ,0, timeoutAmount

      task.always ->
        expect(foo.bar.calls.any()).toEqual(true)

      expect(foo.bar.calls.any()).toEqual(false)

      result1 = task.run(1)
      result2 = task.run(2)

      setTimeout ->
#          console.log 'after ' + timeoutAmount + 'ms'
        expect(foo.bar.calls.count()).toEqual(2)
        expect(memo[1]).toEqual(1)
        expect(memo[2]).toEqual(1)
        result1.pause()
      , timeoutAmount + safetyMargin

      setTimeout ->
#          console.log 'after ' + 2 * timeoutAmount + 'ms'
        expect(foo.bar.calls.count()).toEqual(3)
        expect(memo[1]).toEqual(1)
        expect(memo[2]).toEqual(2)
        result1.resume()
      , 2 * timeoutAmount + safetyMargin

      setTimeout ->
#          console.log 'after ' + 3 * timeoutAmount + 'ms'
        expect(foo.bar.calls.count()).toEqual(5)
        expect(memo[1]).toEqual(2)
        expect(memo[2]).toEqual(3)
        task.abort()
      , 3 * timeoutAmount + safetyMargin

      setTimeout ->
        done()
      , 4 * timeoutAmount + safetyMargin
      return


    it 'uses `pause`/`resume` method pair called on task to pause/resume the execution of  all run-instances', (done)->
      foo = {
        bar: (() ->
        )
      }
      spyOn(foo, 'bar').and.callThrough()

      timeoutAmount = 100
      safetyMargin = Math.floor(timeoutAmount / 2)

      task = new CrunchTask (init, body, fin)->
        body foo.bar, 0, timeoutAmount

      expect(foo.bar.calls.any()).toEqual(false)

      task.always ()->
        expect(foo.bar.calls.any()).toEqual(true)

      result1 = task.run()
      result2 = task.run()

      setTimeout ->
        expect(foo.bar.calls.count()).toEqual(2 * 1)
        task.pause()
      , timeoutAmount + safetyMargin

      setTimeout ->
        expect(foo.bar.calls.count()).toEqual(2 * 1)
        task.resume()
      , 2 * timeoutAmount + safetyMargin

      setTimeout ->
        expect(foo.bar.calls.count()).toEqual(2 * 2)
        task.abort()
      , 3 * timeoutAmount + safetyMargin

      setTimeout ->
        done()
      , 4 * timeoutAmount + safetyMargin
      return

    it 'uses `onIdle()` method to signal  all instances are finished and `isIdle()` method to check', (done)->
      task = new CrunchTask (init, body, fin)->
        body (resolve)->
          debugger;
          do resolve
        return
      task.onIdle ()->
        expect(task.isIdle()).toBe(true)
        done()

      expect(task.isIdle()).toBe(true)
      task.run()
      task.run()
      expect(task.isIdle()).toBe(false)

      return

    return


  describe 'Examples in the readme.md file', ->
    collatzTask = null
    beforeEach ()->
      collatzTask = new CrunchTask (init, body, fin) ->
        nInit = n = threshold = null
        totalStoppingTime = 0

        init (_n, _threshold)->
          nInit = n = _n
          threshold = _threshold
          return

        body (resolve, reject)->
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
          if status is false
            console.log 'Collatz conjecture breaking candidate:', nInit
          return
        return
      return


    it 'implements a Collatz conjecture, aka 3n + 1 problem, algorithm', (ddone)->

      collatzTask.onIdle ddone

      collatzTask.run(1).done (arr)->
        [n, count] = arr
        expect(n).toEqual(1)
        expect(count).toEqual(0)
        return

      collatzTask.run(6).done (arr)->
        [n, count] = arr
        expect(n).toEqual(6)
        expect(count).toEqual(8)
        return

      collatzTask.run(63728127).done (arr)->
        [n, count] = arr
        expect(n).toEqual(63728127)
        expect(count).toEqual(949)
        return

#      for v, k in [0, 1, 7, 2, 5, 8, 16, 3, 19, 6, 14, 9, 9, 17, 17, 4, 12, 20, 20, 7, 7, 15, 15, 10, 23, 10, 111, 18, 18, 18, 106, 5, 26, 13, 13, 21, 21, 21, 34, 8, 109, 8, 29, 16, 16, 16, 104, 11, 24, 24]
#        ((v, k) ->
#          collatzTask.run(k + 1).done (arr)->
#            [n, count] = arr
##              console.log(arr)
#            expect(n).toEqual(k + 1)
#            expect(count).toEqual(v)
#            return
#          return
#        )(v, k)

      return

    return

  return
