CrunchTask = CrunchTask
Promise = Promise

if (typeof require is 'function')
  CrunchTask = require('../../build/crunchtask')
  Promise = require('promise-polyfill')
  utils = require('./utils.coffee')

root = typeof window is 'object' && window ? window : global
type = root.type || utils.type
whenAll = root.whenAll || utils.whenAll

describe 'CrunchTask Events Spec.', ->

  it 'Ensures the onIdle is called once per task batch', (done)->

    foo = {
      bar: ()->
    }

    spyOn(foo, 'bar').and.callThrough()

    task = new CrunchTask (init, body, fin)->
      count = 0
      init (_count)->
        count = _count
        return
      body (resolve)->
        if (!count) then return resolve()
        count--
        return
      return

    range = CrunchTask.range([100,109, true], task)

    taskCount = 0
    maxTaskCount = 0

    task.onRun(()->
      taskCount++
      maxTaskCount = Math.max(maxTaskCount, taskCount)
      return
    ).always(()->
      taskCount--
      return
    ).onIdle(foo.bar
    ).onIdle(()->
      setTimeout(()->
        expect(maxTaskCount).toEqual(10)
        expect(taskCount).toBe(0)
        expect(foo.bar).toHaveBeenCalled()
        expect(foo.bar.calls.count()).toEqual(1)
        done()
        return
      , 100)

      return
    )

    range.run();

    return

  return