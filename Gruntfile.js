/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({

    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',

    // Custome Paths
    srcFiles: ['src/js/*.js'], // source files
    componentsDir: 'src/js/components', // bower components
    testFiles: ['<%= componentsDir %>/viewerjs/spec/*.spec.js', 'spec/*.spec.js'], // test files (jasmine specs)

    // Task configuration.
    jshint: { // check javascript syntax and errors
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        unused: true,
        boss: true,
        eqnull: true,
        browser: true,
        globals: {
          jQuery: true, $: true, console: true, alert: true, require: true, describe: true,
          it: true, expect: true, beforeEach: true, afterEach: true, define: true
        }
      },
      source: {
        src: '<%= srcFiles %>'
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      test: {
        src: '<%= testFiles %>'
      }
    },

    jasmine: { // run tests
      test: {
        //src: '<%= jshint.source.src %>', this line must be commented when using the define function within the specs files
        options: {
          specs: '<%= jshint.test.src %>',
          template: require('grunt-template-jasmine-requirejs'),
          templateOptions: {
            version: '<%= componentsDir %>/requirejs/require.js',
            requireConfigFile: 'src/main.js', // requireJS's config file
            requireConfig: {
              baseUrl: '<%= componentsDir %>' // change base url to execute tests from local FS
            }
          }
        }
      }
    },

    requirejs: { // concat and minimize AMD modules
      compile: {
        options: {
          baseUrl: '<%= componentsDir %>',
          paths: {
            jquery: 'empty:', // does not include jquery in the output
            jquery_ui: 'empty:', // does not include jquery_ui in the output
          },
          name: '<%= pkg.name %>',
          mainConfigFile: 'src/main.js',
          out: 'dist/js/<%= pkg.name %>.js'
        }
      }
    },

    cssmin: { // concat and minimize css
      dist: {
        files: {
          'dist/styles/<%= pkg.name %>.css': ['<%= componentsDir %>/rendererjs/src/styles/*.css',
          '<%= componentsDir %>/rboxjs/src/styles/*.css',
          '<%= componentsDir %>/thbarjs/src/styles/*.css',
          '<%= componentsDir %>/toolbarjs/src/styles/*.css',
          '<%= componentsDir %>/chatjs/src/styles/*.css', 'src/styles/**/*.css']
        }
      }
    },

    uglify: { // minimize the main.js
      main: {
        files: {
          'dist/main.js': ['src/main.js']
        }
      }
    },

    processhtml: { // proccess index.html to remove <link> elements not required after building
      dist: {
        files: {
          'dist/index.html': ['src/index.html']
        }
      }
    },

    copy: {
      images: { // copy requiered images and icons
        files: [{expand: true, cwd: 'src/', src: ['images/**'], dest: 'dist/'}]
      },
      libs: { // copy requiered libs which were not concatenated

      },
      components: { // copy requiered bower components which were not concatenated
        files: [
          { expand: true,
            cwd: '<%= componentsDir %>',
            src: ['requirejs/require.js', 'jquery/dist/jquery.min.js',
              'jquery-ui/jquery-ui.min.js', 'jquery-ui/themes/smoothness/**'],
            dest: 'dist/js/components' }]
      },
    },

    watch: {
      source: {
        files: '<%= jshint.source.src %>',
        tasks: ['jshint:source']
      },
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      test: {
        files: '<%= jshint.test.src %>',
        tasks: ['jshint:test', 'jasmine']
      }
    },

    browserSync: {
        dev: {
            bsFiles: {
                src : [
                    'src/**/*.js',
                    'src/**/*.css',
                    'src/**/*.html'
                ]
            },
            options: {
                watchTask: true,
                // test to move bower_components out...
                // bower_components not used yet...
                server: ['src', 'bower_components']
            }
        }
    },

  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-processhtml');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-browser-sync');
  grunt.loadNpmTasks('grunt-contrib-requirejs');

  // Serve task.
  grunt.registerTask('serve', function (/*target*/) {
    // grunt server:dist not implemented yet...

    // if (target === 'dist') {
    //   return grunt.task.run(['build', 'browserSync:dist',
    //   'watch']);
    // }

    grunt.task.run([
      'browserSync:dev',
      'watch'
    ]);
  });
  // Test task.
  grunt.registerTask('test', ['jshint', 'jasmine']);
  // Build task.
  grunt.registerTask('build', ['processhtml', 'cssmin', 'jshint', 'jasmine', 'requirejs', 'uglify', 'copy']);
  // Default task.
  grunt.registerTask('default', ['build']);

};
