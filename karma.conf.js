// Karma configuration
// Generated on Sun Nov 30 2014 04:50:50 GMT+0400 (GET)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
       'bower_components/promise-polyfill/Promise.js',
       'bower_components/promise-done-6.0.0/index.js',
      'lib/*.js',
      'test/unit/utils.coffee',
      'test/**/*Spec.coffee'
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      '**/*.coffee': ['coffee'],
      'lib/*.js': ['coverage']
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress', 'coverage'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome', 'PhantomJS', 'Firefox', 'IE' ],



    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,
    browserNoActivityTimeout: 100000,

    plugins : ['karma-*', //],
      'karma-jasmine',
      'karma-coverage',
      'karma-phantomjs-launcher',
      'karma-ie-launcher',
      'karma-firefox-launcher',
    //plugins :
        //[
    //  //'karma-junit-reporter',
    //  'karma-chrome-launcher',
      'karma-phantomjs-launcher'
        ],
    //  //'karma-firefox-launcher',
    //  //'karma-opera-launcher',
    //  //'karma-ie-launcher',
    //  'karma-jasmine'
    //],
    // This is the new content for your travis-ci configuration test
    //  Custom launcher for Travis-CI
    customLaunchers: {
      Chrome_travis_ci: {
        base: 'Chrome',
        flags: ['--no-sandbox']
      }
    },

    coffeePreprocessor: {
      // options passed to the coffee compiler
      options: {
        bare: true,
        sourceMap: true
      },
      // transforming the filenames
      transformPath: function(path) {
        return path.replace(/\.coffee$/, '.js');
      }
    },

    coverageReporter: {
      type : 'lcov',
      dir : 'coverage/'
    }


  });

  if (process.env.TRAVIS){
    config.browsers = ['Chrome_travis_ci', 'PhantomJS'];
  }

};
