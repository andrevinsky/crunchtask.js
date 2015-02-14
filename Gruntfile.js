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
      browser: {
        files: [
          {
            src: [
              'bower_components/promise-polyfill/Promise.js',
              'lib/<%= pkg.name %>.js'
            ],
            dest: 'dest/<%= pkg.name %>.js',
            nonull: true
          }
        ]
      }
    },

		uglify: {
      options: {
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %> */'
      },
      browser: {
        src: 'dest/<%= pkg.name %>.js',
        dest: 'dest/<%= pkg.name %>.min.js'
      }
		}

	});

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.loadNpmTasks('grunt-bump');

	grunt.registerTask('build', ['concat:browser', 'uglify:browser']);
	grunt.registerTask('bump-minor', ['bump:minor']);

};