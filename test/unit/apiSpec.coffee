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
    task = null

    beforeEach ->
      task = new CrunchTask (init, body, fin)->
        return

    it 'creates instances of CrunchTask class by a simple function call', ->
      result = CrunchTask()
      expect(result instanceof CrunchTask).toEqual(true)

    it '.. or by a `new CrunchTask` instantiation', ->
      result = new CrunchTask
      expect(result instanceof CrunchTask).toEqual(true)

    it 'uses a simple construction function', ->
      result = new CrunchTask (init, body, fin)->
        expect(true).toEqual(true)
      expect(result.run).toBeDefined();
      expect(type(result.run)).toEqual('function')
      result.run()

    it '.. or a task', ->
      result = new CrunchTask(task)
      expect(result.id).not.toEqual(task.id)

  describe 'API: ', ->
    task = null

    beforeEach ->
      task = new CrunchTask (init, body, fin)->
        return

    it 'declares `run` method', ->
      expect(task.run).toBeDefined()

    it 'has no prototypal `run` method', ->
      expect(CrunchTask::run).not.toBeDefined()

    it 'declares `onRun` method', ->
      expect(task.onRun).toBeDefined()

    it 'declares `done` method', ->
      expect(task.done).toBeDefined()

    it 'declares `always` method', ->
      expect(task.always).toBeDefined()

    it 'returns promise object when `run` is called', ->
      result = task.run()

      expect(result).toBeDefined()
      expect(result instanceof Promise).toEqual(true)


  describe 'Usage Patterns: ', ->
    task = null

    beforeEach  (done) ->
      task = new CrunchTask (init, body, fin)->
        return

      setTimeout((()-> do done), 1)
      done();

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

    it 'triggers `done` handlers when completion is reached', (done)->
      task = new CrunchTask
      task.always(
        (arg1, arg2, arg3) ->
          expect(arg1).toBe('empty.description')
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








