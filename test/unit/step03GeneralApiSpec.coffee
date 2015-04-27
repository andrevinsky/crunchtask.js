CrunchTask = CrunchTask
Promise = Promise

if (typeof require is 'function')
  CrunchTask = require('../../lib/crunchtask')
  Promise = require('../../node_modules/promise-polyfill/Promise')
  utils = require('./utils.coffee')

root = typeof window is 'object' && window ? window : global
type = root.type || utils.type
whenAll = root.whenAll || utils.whenAll

describe 'CrunchTask API Spec.', ->

  describe 'API. CrunchTask instance..', ->
    task = null

    beforeEach ->
      task = new CrunchTask (init, body, fin)->
        return
      return

    afterEach ->
      task = null
      return

    it 'property `id` - a unique task identifier', ->
      task2 = new CrunchTask ()->
        return

      expect(task.id).toBeDefined()
      expect(task2.id).toBeDefined()

      expect(task.id).not.toEqual(task2.id)
      return

    it 'property `timestamp` - a timestamp when the task was created, of type Number', ->
      expect(task.timestamp).toBeDefined()
      expect(type(task.timestamp)).toEqual('number')
      expect(Math.abs(new Date() - task.timestamp) < 1000).toBe(true)
      return

    it 'method `run()` - creates a run-instance of a task ', ->
      expect(task.run).toBeDefined()
      expect(type(task.run)).toEqual('function')
      return

    it 'method `then()` - allows chaining of tasks', ->
      expect(task.then).toBeDefined()
      expect(type(task.then)).toEqual('function')
      return

    it 'method `onRun()` - signals each time the task is run', ->
      expect(task.onRun).toBeDefined()
      expect(type(task.onRun)).toEqual('function')
      return

    it 'declares `onIdle()` method', ->
      expect(task.onIdle).toBeDefined()
      expect(type(task.onIdle)).toEqual('function')
      return

    it 'declares `onError()` method', ->
      expect(task.onError).toBeDefined()
      expect(type(task.onError)).toEqual('function')
      return

    it 'method `done()` - signals each time the task is ended successfully', ->
      expect(task.done).toBeDefined()
      expect(type(task.done)).toEqual('function')
      return

    it 'method `fail()` - signals each time the task fails', ->
      expect(task.fail).toBeDefined()
      expect(type(task.fail)).toEqual('function')
      return

    it 'method `always()` - signals each time the task is ended, regardless of success or not', ->
      expect(task.always).toBeDefined()
      expect(type(task.always)).toEqual('function')
      return

    it 'method `progress()` - allows the body function to communicate its progress for all run instances', ->
      expect(task.progress).toBeDefined()
      expect(type(task.progress)).toEqual('function')
      return

    it 'method `abort()` - cancels execution of all active run-instances together', ->
      expect(task.abort).toBeDefined()
      expect(type(task.abort)).toEqual('function')
      return

    it 'method `pause()` - pauses execution of all active run-instances together', ->
      expect(task.pause).toBeDefined()
      expect(type(task.pause)).toEqual('function')
      return

    it 'method `resume()` - resume the paused execution of all run-instances', ->
      expect(task.resume).toBeDefined()
      expect(type(task.resume)).toEqual('function')
      return

    it 'method `isIdle():{Boolean}` - false, if any active run-instance is present', ->
      expect(task.isIdle).toBeDefined()
      expect(type(task.isIdle)).toEqual('function')
      return

    return

  describe 'API of run-task instance..', ->
    task = null
    runInst = null

    beforeEach ->
      task = new CrunchTask (init, body, fin)->
        body ()->
          return
        return
      runInst = task.run()
      return

    afterEach ->
      task.abort() if task
      task = null
      return

    it 'run-task instance is a Promise-instance', ->
      expect(runInst instanceof Promise).toBe(true)
      return

    it 'method `then()` - is a Promise method', ->
      expect(runInst.then).toBeDefined()
      expect(type(runInst.then)).toEqual('function')
      return

    it 'method `done()` - ', ->
      expect(runInst.done).toBeDefined()
      expect(type(runInst.done)).toEqual('function')
      return

    it 'method `fail()` - ', ->
      expect(runInst.fail).toBeDefined()
      expect(type(runInst.fail)).toEqual('function')
      return

    it 'method `always()` - ', ->
      expect(runInst.always).toBeDefined()
      expect(type(runInst.always)).toEqual('function')
      return

    it 'method `onError()` - ', ->
      expect(runInst.onError).toBeDefined()
      expect(type(runInst.onError)).toEqual('function')
      return

    it 'method `progress()` - ', ->
      expect(runInst.progress).toBeDefined()
      expect(type(runInst.progress)).toEqual('function')
      return

    return

  describe 'Errors are events happening during task runtime and usually signify exceptions', ->
    task = null

    afterEach ()->
      task = null

    it 'Error callbacks represent also a rejection of the promise', (done)->
      foo = {
        resolvedHandler: ()->
        rejectedHandler: ()->
      }
      spyOn(foo, 'resolvedHandler').and.callThrough()
      spyOn(foo, 'rejectedHandler').and.callThrough()

      task = new CrunchTask (init, body)->
        body ()->
          return
        throw new Error()
        return

      task.run().then foo.resolvedHandler, foo.rejectedHandler

      expect(foo.resolvedHandler).not.toHaveBeenCalled()
      expect(foo.rejectedHandler).not.toHaveBeenCalled()

      setTimeout ()->
        expect(foo.resolvedHandler).not.toHaveBeenCalled()
        expect(foo.rejectedHandler).toHaveBeenCalled()

        done()
        return
      , 500

      return

    it 'Here a sample task description that doesn\'t generate error', (done)->
      foo = {
        errorTaskOkHandler: (arg1, arg2)->
          console.info(arg1, arg2)
          return
        errorRunTaskOkHandler: (arg1, arg2)->
          console.info(arg1, arg2)
          return
      }
      spyOn(foo, 'errorTaskOkHandler').and.callThrough()
      spyOn(foo, 'errorRunTaskOkHandler').and.callThrough()

      task = new CrunchTask (init, body)->
        body ()->
          return
        return

      expect(task instanceof CrunchTask).toBe(true)

      task.onError foo.errorTaskOkHandler

      expect(foo.errorTaskOkHandler).not.toHaveBeenCalled()
      expect(foo.errorRunTaskOkHandler).not.toHaveBeenCalled()

      task.run().onError foo.errorRunTaskOkHandler

      setTimeout ()->
        expect(foo.errorTaskOkHandler).not.toHaveBeenCalled()
        expect(foo.errorRunTaskOkHandler).not.toHaveBeenCalled()
        task.abort()
        done()
      ,10

      return

    it 'requires a description function to be present', (done)->
      foo = {
        errorTaskHandler: ()->
        errorRunHandler: ()->
      }
      spyOn(foo, 'errorTaskHandler').and.callThrough()
      spyOn(foo, 'errorRunHandler').and.callThrough()

      task = new CrunchTask()

      expect(task instanceof CrunchTask).toBe(true)

      task.onError foo.errorTaskHandler

      expect(foo.errorTaskHandler).not.toHaveBeenCalled()
      expect(foo.errorRunHandler).not.toHaveBeenCalled()

      task.run().onError foo.errorRunHandler

      expect(foo.errorTaskHandler).not.toHaveBeenCalled()
      expect(foo.errorRunHandler).not.toHaveBeenCalled()

      setTimeout ()->
        expect(foo.errorTaskHandler).toHaveBeenCalled()
        expect(foo.errorTaskHandler.calls.argsFor(0)[0]).toEqual('CrunchTask.description.empty')

        expect(foo.errorRunHandler).toHaveBeenCalled()
        expect(foo.errorRunHandler.calls.argsFor(0)[0]).toEqual('CrunchTask.description.empty')

        done()
      ,10
      return

    it 'requires the description function not to throw during instantiation', (done)->
      foo = {
        errorTaskHandler: ()->
        errorRunHandler: ()->
      }
      spyOn(foo, 'errorTaskHandler').and.callThrough()
      spyOn(foo, 'errorRunHandler').and.callThrough()

      task = new CrunchTask ()->
        throw new Error()
        return

      expect(task instanceof CrunchTask).toBe(true)

      task.onError foo.errorTaskHandler

      expect(foo.errorTaskHandler).not.toHaveBeenCalled()
      expect(foo.errorRunHandler).not.toHaveBeenCalled()

      task.run().onError foo.errorRunHandler

      expect(foo.errorTaskHandler).not.toHaveBeenCalled()
      expect(foo.errorRunHandler).not.toHaveBeenCalled()

      setTimeout ()->
        expect(foo.errorTaskHandler).toHaveBeenCalled()
        expect(foo.errorTaskHandler.calls.argsFor(0)[0]).toEqual('CrunchTask.description.else')

        expect(foo.errorRunHandler).toHaveBeenCalled()
        expect(foo.errorRunHandler.calls.argsFor(0)[0]).toEqual('CrunchTask.description.else')

        done()
      ,10
      return

    it 'requires the init setup to be a function when supplied', (done)->
      foo = {
        errorTaskHandler: ()->
        errorRunHandler: ()->
      }
      spyOn(foo, 'errorTaskHandler').and.callThrough()
      spyOn(foo, 'errorRunHandler').and.callThrough()

      task = new CrunchTask (init, body)->
        init 1 #not a function
        body ()->
          return
        return

      expect(task instanceof CrunchTask).toBe(true)

      task.onError foo.errorTaskHandler

      expect(foo.errorTaskHandler).not.toHaveBeenCalled()
      expect(foo.errorRunHandler).not.toHaveBeenCalled()

      task.run().onError foo.errorRunHandler

      expect(foo.errorTaskHandler).not.toHaveBeenCalled()
      expect(foo.errorRunHandler).not.toHaveBeenCalled()

      setTimeout ()->
        expect(foo.errorTaskHandler).toHaveBeenCalled()
        expect(foo.errorTaskHandler.calls.argsFor(0)[0]).toEqual('CrunchTask.description.initSetup')

        expect(foo.errorRunHandler).toHaveBeenCalled()
        expect(foo.errorRunHandler.calls.argsFor(0)[0]).toEqual('CrunchTask.description.initSetup')

        done()
      ,10
      return

    it 'requires the required body setup to be a function, second param is a number or false if specified, third is an optional number', (done)->
      foo = {
        errorTaskHandler: ()->
        errorRunHandler: ()->
      }
      spyOn(foo, 'errorTaskHandler').and.callThrough()
      spyOn(foo, 'errorRunHandler').and.callThrough()

      #1
      task = new CrunchTask (init, body)->
        body 1
        return

      expect(task instanceof CrunchTask).toBe(true)

      task.onError foo.errorTaskHandler

      expect(foo.errorTaskHandler).not.toHaveBeenCalled()
      expect(foo.errorRunHandler).not.toHaveBeenCalled()

      task.run().onError foo.errorRunHandler

      #2
      task = new CrunchTask (init, body)->
        body( (()->) , '')
        return

      expect(task instanceof CrunchTask).toBe(true)

      task.onError foo.errorTaskHandler

      expect(foo.errorTaskHandler).not.toHaveBeenCalled()
      expect(foo.errorRunHandler).not.toHaveBeenCalled()

      task.run().onError foo.errorRunHandler


      #3
      task = new CrunchTask (init, body)->
        body( (()->) , 3, {} )
        return

      expect(task instanceof CrunchTask).toBe(true)

      task.onError foo.errorTaskHandler

      expect(foo.errorTaskHandler).not.toHaveBeenCalled()
      expect(foo.errorRunHandler).not.toHaveBeenCalled()

      task.run().onError foo.errorRunHandler


      expect(foo.errorTaskHandler).not.toHaveBeenCalled()
      expect(foo.errorRunHandler).not.toHaveBeenCalled()

      setTimeout ()->
        expect(foo.errorTaskHandler).toHaveBeenCalled()
        expect(foo.errorRunHandler).toHaveBeenCalled()

        expect(foo.errorTaskHandler.calls.count()).toEqual(3)
        expect(foo.errorRunHandler.calls.count()).toEqual(3)

        #1
        expect(foo.errorTaskHandler.calls.argsFor(0)[0]).toEqual('CrunchTask.description.bodySetup')
        expect(foo.errorTaskHandler.calls.argsFor(0)[1]).toMatch(/expects a function/i)

        expect(foo.errorRunHandler.calls.argsFor(0)[0]).toEqual('CrunchTask.description.bodySetup')
        expect(foo.errorRunHandler.calls.argsFor(0)[1]).toMatch(/expects a function/i)

        #2
        expect(foo.errorTaskHandler.calls.argsFor(1)[0]).toEqual('CrunchTask.description.bodySetup')
        expect(foo.errorTaskHandler.calls.argsFor(1)[1]).toMatch(/expects a number or false/i)

        #3
        expect(foo.errorTaskHandler.calls.argsFor(2)[0]).toEqual('CrunchTask.description.bodySetup')
        expect(foo.errorTaskHandler.calls.argsFor(2)[1]).toMatch(/expects a number/i)

        done()
      ,10
      return

    it 'requires the fin setup to be a function when supplied', (done)->
      foo = {
        errorTaskHandler: ()->
        errorRunHandler: ()->
      }
      spyOn(foo, 'errorTaskHandler').and.callThrough()
      spyOn(foo, 'errorRunHandler').and.callThrough()

      task = new CrunchTask (init, body, fin)->
        fin 1 #not a function
        body ()->
          return
        return

      expect(task instanceof CrunchTask).toBe(true)

      task.onError foo.errorTaskHandler

      expect(foo.errorTaskHandler).not.toHaveBeenCalled()
      expect(foo.errorRunHandler).not.toHaveBeenCalled()

      task.run().onError foo.errorRunHandler

      expect(foo.errorTaskHandler).not.toHaveBeenCalled()
      expect(foo.errorRunHandler).not.toHaveBeenCalled()

      setTimeout ()->
        expect(foo.errorTaskHandler).toHaveBeenCalled()
        expect(foo.errorTaskHandler.calls.argsFor(0)[0]).toEqual('CrunchTask.description.finSetup')

        expect(foo.errorRunHandler).toHaveBeenCalled()
        expect(foo.errorRunHandler.calls.argsFor(0)[0]).toEqual('CrunchTask.description.finSetup')

        done()
      ,10
      return

    it 'signals exceptions in the init fn', (done)->
      foo = {
        errorTaskHandler: ()->
        errorRunHandler: ()->
      }
      spyOn(foo, 'errorTaskHandler').and.callThrough()
      spyOn(foo, 'errorRunHandler').and.callThrough()

      task = new CrunchTask (init, body)->
        init ()->
          throw new Error()
          return
        body ()->
          return
        return

      expect(task instanceof CrunchTask).toBe(true)

      task.onError foo.errorTaskHandler

      expect(foo.errorTaskHandler).not.toHaveBeenCalled()
      expect(foo.errorRunHandler).not.toHaveBeenCalled()

      task.run().onError foo.errorRunHandler

      expect(foo.errorTaskHandler).not.toHaveBeenCalled()
      expect(foo.errorRunHandler).not.toHaveBeenCalled()

      setTimeout ()->
        expect(foo.errorTaskHandler).toHaveBeenCalled()
        expect(foo.errorTaskHandler.calls.argsFor(0)[0]).toEqual('CrunchTask.description.init')

        expect(foo.errorRunHandler).toHaveBeenCalled()
        expect(foo.errorRunHandler.calls.argsFor(0)[0]).toEqual('CrunchTask.description.init')

        done()
      , 1000
      return

    return

  return
