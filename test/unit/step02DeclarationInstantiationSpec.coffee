CrunchTask = CrunchTask
Promise = Promise

if (typeof require is 'function')
  CrunchTask = require('../../lib/crunchtask')
  Promise = require('../../node_modules/promise-polyfill')
  utils = require('./utils.coffee')

root = typeof window is 'object' && window ? window : global
type = root.type || utils.type
whenAll = root.whenAll || utils.whenAll

describe 'CrunchTask Declaration & Instantiation Spec.', ->
  it 'a type CrunchTask is declared on the global scope', ->
    expect(CrunchTask).toBeDefined()
    return

  it 'instances of CrunchTask class are created by a function call', ->
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

  it 'signals of the unmet conditions via the .error handler', (done)->
    task = new CrunchTask ()->
      return
    task.run().onError done
    return

  it 'Never throws exceptions', ->
    expect(()->
      CrunchTask()
    ).not.toThrow()

    expect(()->
      CrunchTask(1, 2, 3)
    ).not.toThrow()
    return

  return
