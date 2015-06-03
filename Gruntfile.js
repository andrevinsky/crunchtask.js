module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

    bump: {
      options: {
        files: ['package.json', 'bower.json'],
        updateConfigs: ["pkg"],
        commit: false,
        commitMessage: 'Release v%VERSION%',
        commitFiles: ['-a'],
        createTag: true,
        tagName: 'v%VERSION%',
        tagMessage: 'Version %VERSION%',
        push: false,
        pushTo: 'upstream',
        gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d',
        globalReplace: false
      }
    },

    concat: {
      options: {
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      browser: {
        files: [
          {
            src: [
              'bower_components/promise-polyfill/Promise.js',
              'lib/<%= pkg.name %>.js'
            ],
            dest: 'dst/<%= pkg.name %>.js',
            nonull: true
          }
        ]
      }
    },

		uglify: {
      options: {
        preserveComments: 'some',
        sourceMap: true //,
        //banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
        //'<%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      browser: {
        src: 'dst/<%= pkg.name %>.js',
        dest: 'dst/<%= pkg.name %>.min.js'
      },
      browserify: {
        src: 'build/<%= pkg.name %>.js',
        dest: 'build/<%= pkg.name %>.min.js'
      }
		},

    browserify: {
      dist: {
        files: {
          'build/crunchtask.js': ['lib/*.js']
        },
        options: {
          transform: ['coffeeify']
        }
      }
    },

    watchify: {
      options: {
      //  // defaults options used in b.bundle(opts)
      //  detectGlobals: true,
      //  insertGlobals: false,
      //  ignoreMissing: false,
      //  debug: false,
      //  standalone: false,
      //
        keepalive: true
      //  callback: function(b) {
      //    // configure the browserify instance here
      //    //b.add();
      //    //b.require();
      //    //b.external();
      //    //b.ignore();
      //    //b.transform();
      //
      //    // return it
      //    return b;
      //  }
      },
      example: {
        src: './lib/crunchtask.js',
        dest: 'build/crunchtask.js'
      }
    },

    karma: {
      unit: {
        configFile: 'karma.conf.js'
      }
    }

	});

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.loadNpmTasks('grunt-browserify');

  grunt.loadNpmTasks('grunt-watchify');

  grunt.loadNpmTasks('grunt-bump');

  grunt.loadNpmTasks('grunt-karma');

  grunt.registerTask('test', ['karma']);

	//grunt.registerTask('build', ['concat:browser', 'uglify:browser']);
	grunt.registerTask('build', ['browserify', 'uglify:browserify']);
	grunt.registerTask('bump-minor', ['bump:minor']);

};
