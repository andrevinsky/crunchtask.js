CrunchTask = CrunchTask
Promise = Promise

if (typeof require == 'function')
  CrunchTask = require('../../lib/crunchtask')
  Promise = require('../../node_modules/promise-polyfill/Promise')

describe 'CrunchTask Events Spec.', ->
  return