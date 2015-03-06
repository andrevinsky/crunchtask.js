CrunchTask = CrunchTask
Promise = Promise

if (typeof require == 'function')
  CrunchTask = require('../../lib/crunchtask')
  Promise = require('../../node_modules/promise-polyfill/Promise')

describe 'CrunchTask Chainability API Spec.', ->

  task = null

  beforeEach ->
    task = new CrunchTask (init, body, fin)->
      return
    return

  afterEach ()->
    task = null
    return

  it 'all task\'s methods can be invoked on the result of `onRun():{CrunchTask}` method', ->
    expect(task.onRun(()->) instanceof CrunchTask).toBe(true)
    return

  it 'all task\'s methods can be invoked on the result of `onIdle():{CrunchTask}` method', ->
    expect(task.onIdle(()->) instanceof CrunchTask).toBe(true)
    return

  it 'all task\'s methods can be invoked on the result of `onError():{CrunchTask}` method', ->
    expect(task.onError(()->) instanceof CrunchTask).toBe(true)
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
