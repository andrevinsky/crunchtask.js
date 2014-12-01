describe 'TaskCruncher API', ->

  type = do ->
    classToType = {}
    for prop in 'Boolean Number String Function Array Date RegExp Object'.split(' ')
      do (prop) ->
        classToType["[object #{prop}]"] = prop.toLowerCase()
    (obj) ->
      if obj == undefined or obj == null
        return String obj
      return classToType[Object::toString.call(obj)]

  task = null

  beforeEach ->
    task = new CrunchTask (init, body, fin)->
      return

  it 'declares a type CrunchTask on the global scope', ->
    expect(CrunchTask).toBeDefined()

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

  it 'returns promise object when `run` is called', ->
    result = task.run()
    debugger;

    expect(result).toBeDefined()
    expect(result instanceof Promise).toEqual(true)


  xit 'can be chained', ->
    result1 = new CrunchTask (init, body, fin)->
      return

    result2 = new CrunchTask (init, body, fin)->
      return

    result3 = result1.then(result2)

    expect(result3).toEqual(result1)
    expect(result3).not.toEqual(result2)
    console.log result3.toString()