CrunchTask = CrunchTask
Promise = Promise

if (typeof require == 'function')
  CrunchTask = require('../../lib/crunchtask')
  Promise = require('../../node_modules/promise-polyfill/Promise')


root = typeof window is 'object' && window ? window : global
type = root.type
whenAll = root.whenAll

describe 'CrunchTask Events Spec.', ->
  return