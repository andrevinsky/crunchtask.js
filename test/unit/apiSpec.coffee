#http://jasmine.github.io/edge/introduction.html
#http://coffeescript.org/
describe 'TaskCruncher Spec: ', ->

  it 'Expect Jasmine Version to be 2.xx', ->
    expect(jasmine.version).toMatch(/^2\./);

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

  describe 'Instantiation: ', ->

    it 'creates instances of CrunchTask class by a simple function call', ->
      result = CrunchTask(() ->)
      expect(result instanceof CrunchTask).toEqual(true)

    it 'throws Error if called with anything else', ->
      expect(CrunchTask).toThrow()

    it '.. or by a `new CrunchTask` instantiation', ->
      result = new CrunchTask(()->)
      expect(result instanceof CrunchTask).toEqual(true)


  describe 'API: ', ->
    task = null

    beforeEach ->
      task = new CrunchTask (init, body, fin)->
        return

    it 'has an `id` property, a unique task identifier, of type Number', ->
      expect(task.id).toBeDefined()
      expect(type(task.id)).toEqual('number')

    it 'has a `timestamp` property, a timestamp when the task was created, of type Number', ->
      expect(task.timestamp).toBeDefined()
      expect(type(task.timestamp)).toEqual('number')
      expect(Math.abs(new Date() - task.timestamp) < 1000).toBe(true)

    it 'declares `run` method', ->
      expect(task.run).toBeDefined()
      expect(type(task.run)).toEqual('function')

    it 'declares `then` method', ->
      expect(task.then).toBeDefined()
      expect(type(task.then)).toEqual('function')

    it 'declares `onRun` method', ->
      expect(task.onRun).toBeDefined()
      expect(type(task.onRun)).toEqual('function')

    it 'declares `done` method', ->
      expect(task.done).toBeDefined()
      expect(type(task.done)).toEqual('function')

    it 'declares `fail` method', ->
      expect(task.fail).toBeDefined()
      expect(type(task.fail)).toEqual('function')

    it 'declares `always` method', ->
      expect(task.always).toBeDefined()
      expect(type(task.always)).toEqual('function')

    it 'declares `progress` method', ->
      expect(task.progress).toBeDefined()
      expect(type(task.progress)).toEqual('function')

    it 'returns promise object when `run` is called', ->
      result = task.run()

      expect(result).toBeDefined()
      expect(result instanceof Promise).toEqual(true)


  describe 'Usage Patterns: ', ->
    task = null

    beforeEach  (done) ->
      task = new CrunchTask (init, body, fin)->
        return

#      setTimeout((()-> do done), 15000)
#      done();

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
        )
        return
      task.run(123)

    xit 'uses `body` function to describe main logic and control its flow with three c/backs'

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

    ddescribe 'longer asynchronous specs', ()->
      originalTimeout = null
      beforeEach  (done) ->
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

      it 'uses `body`/`notify` c/back to notify listeners of the progress of the task', ((done) ->
        foo = {
          bar: (() ->
            console.log (new Date() - 0)
          )
        }
        console.log(jasmine.DEFAULT_TIMEOUT_INTERVAL)
        spyOn(foo, 'bar').and.callThrough();

        task = new CrunchTask (init, body, fin)->
          count = 10
          body((resolve, reject, notify)->
            notify('const', count--)
            if !count
              resolve()
          )
          return

        task.progress(foo.bar)

        expect(foo.bar.calls.any()).toEqual(false)

        task.run()

        task.always(()->
          debugger;
          expect(foo.bar.calls.any()).toEqual(true)
          expect(foo.bar.calls.count()).toEqual(10)
          done()
        )
      )

      afterEach  () ->
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;


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
      task = new CrunchTask(()->)
      task.always(
        (arg1, arg2, arg3) ->
          expect(arg1).toBeDefined()
          do done)
      task.run()

    it 'can be chained with the `then()` method creating a new task', ->
        result1 = new CrunchTask (init, body, fin)->
          return

        result2 = new CrunchTask (init, body, fin)->
          return

        result3 = result1.then(result2)

        expect(result3).not.toEqual(result1)
        expect(result3).not.toEqual(result2)
        expect(result3 instanceof CrunchTask).toEqual(true)








