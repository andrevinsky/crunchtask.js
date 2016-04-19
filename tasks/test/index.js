var utils = require('../_utils')

module.exports = function(options) {

  options = utils.extend({
    // flag used to trigger only the local tests without using saucelabs
    saucelabs: false
  }, options)
  // run karma
  return utils.exec(
    './node_modules/.bin/karma',
    [
      'start',
      'tasks/test/karma.conf.js'
    ],
    // add some environment variables also used in karma.conf.js
    {
      LIBRARY_NAME: global.library,
      TRAVIS_JOB_ID: process.env.TRAVIS_JOB_ID,
      // Remember to change these using your project opensauce credentials
      SAUCE_USERNAME: 'andrevinsky',
      SAUCE_ACCESS_KEY: 'c8a4d41b-d72d-4a4d-a014-9f92d7cc48b0',
      SAUCELABS: options.saucelabs
    }
  )

}