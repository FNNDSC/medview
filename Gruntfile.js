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
    srcFiles: ['src/**/*.js'], // source files
    componentsDir: 'bower_components', // bower components
    testFiles: ['spec/*.spec.js'], // test files (jasmine specs)

    // Task configuration.
    jscs: { // check javascript style
      options: {
        config: '.jscsrc',  // configuration file
        fix: true,
        force: true
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

    jshint: { // check javascript syntax and errors
      options: {
        jshintrc: true // configuration file
      },
      source: {
        src: '<%= jscs.source.src %>'
      },
      gruntfile: {
        src: '<%= jscs.gruntfile.src %>'
      },
      test: {
        src: '<%= jscs.test.src %>'
      }
    },

    connect: {
      test: {
        options: {
          hostname: 'localhost',
          port: 8001,
          base: ['.']
        }
      }
    },

    requirejs: { // concat and minimize AMD modules
      compile: {
        options: {
          baseUrl: '<%= componentsDir %>',
          paths: {
            jquery: 'empty:', // does not include jquery in the output
            jqueryUi: 'empty:', // does not include jquery_ui in the output
          },
          name: '<%= pkg.name %>',
          mainConfigFile: 'src/config.js',
          out: 'dist/js/<%= pkg.name %>.min.js',
        }
      }
    },

    cssmin: { // concat and minimize css
      dist: {
        files: {
          'dist/styles/<%= pkg.name %>.css': [
          '<%= componentsDir %>/rendererjs/src/styles/*.css',
          '<%= componentsDir %>/rboxjs/src/styles/*.css',
          '<%= componentsDir %>/thbarjs/src/styles/*.css',
          '<%= componentsDir %>/toolbarjs/src/styles/*.css',
          '<%= componentsDir %>/chatjs/src/styles/*.css',
          '<%= componentsDir %>/medview/src/styles/*.css']
        }
      }
    },

    uglify: { // minimize the built main.js
      main: {
        files: {
          'dist/main.js': ['src/main.build.js']
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

    htmlmin: { // minify HTML
      dist: {
        options: {
          removeComments: true,
          collapseWhitespace: true
        },
        files: {
          'dist/index.html': 'dist/index.html'
        }
      },
    },

    copy: {
      images: { // copy requiered images and icons
        files: [
          {
            expand: true,
            cwd: 'src/',
            src: ['images/**'],
            dest: 'dist/'
          }
        ]
      },
      components: {
        files: [
          {expand: true,
            cwd: '<%= componentsDir %>',
            src: ['requirejs/require.js',
                  'jquery/dist/jquery.min.js',
                  'jquery-ui/jquery-ui.min.js',
                  'jquery-ui/themes/smoothness/**'],
            dest: 'dist/libs'}]
      },
      module: { // copy the module as a bower component to <%= componentsDir %>
        files: [
          {
            expand: true,
            src: ['src/js/**/*', 'src/styles/**/*', 'src/images/**/*'],
            dest: '<%= componentsDir %>/<%= pkg.name %>/'
          }]
      }
    },

    watch: {
      source: {
        files: '<%= jshint.source.src %>',
        tasks: ['jscs:source', 'jshint:source', 'copy:module']
      },
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jscs:source', 'jshint:gruntfile']
      },
      test: {
        files: '<%= jshint.test.src %>',
        tasks: ['jscs:source', 'jshint:test', 'jasmine']
      }
    },

    browserSync: {
      dev: {
        bsFiles: {
          src: [
              'demo/**/*.js',
              'demo/**/*.css',
              'demo/**/*.html',
              'src/**/*.js',
              'src/**/*.css',
              'src/**/*.html'
          ]
        },
        options: {
          watchTask: true,
          // serve base dir
          server: ['.'],
          startPath: '/src'
        }
      }
    },

    clean: {
      all: ['dist']
    }

  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-processhtml');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-jscs');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-browser-sync');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-clean');

  // Serve task.
  grunt.registerTask('serve', function(/*target*/) {

    grunt.task.run([
      'copy:module',
      'browserSync:dev',
      'watch'
    ]);
  });

  // Test task.
  grunt.registerTask('test', ['jscs', 'jshint', 'copy:module', 'connect']);

  // Build task.
  grunt.registerTask('build', [
    'clean:all',
    'test', 'processhtml', 'htmlmin', 'cssmin',
    'copy:images', 'copy:components', 'uglify:main',
    'requirejs']);

  // Default task.
  grunt.registerTask('default', ['build']);

};
