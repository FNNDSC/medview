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
    srcFiles: ['src/main.js, src/viewer/js/*.js'],
    components: ['src/viewer/components/jquery/dist/jquery.min.js', 'src/viewer/components/jquery-ui/jquery-ui.min.js',
      'src/viewer/components/requirejs/require.js'],
    lib: ['src/viewer/lib/*.js', 'src/viewer/lib/fancytree/jquery.fancytree.min.js']
    // Task configuration.
    jshint: {
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
          jQuery: true
        }
      },
      source: {
        src: '<%= srcFiles %>'
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      test: {
        files: ['test/**/*.js']
      }
    },
    jasmine: {
      src: '<%= jshint.source.src %>',
      options: {
        specs: 'test/**/*_spec.js',
        helpers: 'test/helpers/*.js'
      }
    },
    concat: {
      options: {
        banner: '<%= banner %>',
        stripBanners: true
      },
      dist: {
        src: ['<%= jshint.source.src %>', '<%= components %>', '<%= lib %>'],
        dest: 'dist/<%= pkg.name %>.js'
      }
    },
    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      dist: {
        src: '<%= concat.dist.dest %>',
        dest: 'dist/<%= pkg.name %>.min.js'
      }
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
      /*test: {
        files: '<%= jshint.test.files %>',
        tasks: ['jshint:test', 'jasmine']
      }*/
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Test task.
  // grunt.registerTask('test', ['jshint', 'jasmine']);
  grunt.registerTask('test', ['jshint']);
  // Default task.
  // grunt.registerTask('default', ['jshint', 'jasmine', 'concat', 'uglify']);
  grunt.registerTask('default', ['jshint', 'concat', 'uglify']);

};
