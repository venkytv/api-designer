'use strict';

var LIVERELOAD_PORT = 35730;
var lrSnippet       = require('connect-livereload')({port: LIVERELOAD_PORT});

function proxy() {
  var url     = require('url');
  var request = require('request');

  return function proxyMiddleware(req, res, next) {
    if (req.method.toUpperCase() === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin',  '*');
      res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With');
      return next();
    }

    var proxy = request({
      uri: url.parse(req.url.slice(1), true)
    });

    // Proxy the error message back to the client.
    proxy.on('error', function (error) {
      res.writeHead(500);
      return res.end(error.message);
    });

    // Workaround for some remote services that do not handle
    // multi-valued Accept header properly by omitting precedence
    if (req.headers.accept) {
      req.headers.accept = req.headers.accept.split(',')[0].trim();
    }

    // Pipe the request data directly into the proxy request and back to the
    // response object. This avoids having to buffer the request body in cases
    // where they could be unexepectedly large and/or slow.
    return req.pipe(proxy).pipe(res);
  };
}

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {
  // load all grunt tasks
  require('load-grunt-tasks')(grunt);

  // configurable paths
  var yeomanConfig = {
    app:  'app',
    dist: 'dist'
  };

  try {
    yeomanConfig.app = require('./bower.json').appPath || yeomanConfig.app;
  } catch (e) {
  }

  grunt.initConfig({
    yeoman: yeomanConfig,

    watch: {
      livereload: {
        options: {
          livereload: LIVERELOAD_PORT
        },

        files: [
          '<%= yeoman.app %>/{,*/}*.html',
          '<%= yeoman.app %>/scripts/{,*/}*.js',
          '<%= yeoman.app %>/styles/{,*/}*.css',
          '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
          '<%= yeoman.app %>/vendor/scripts/{,*/}*.js',
          '<%= yeoman.app %>/vendor/styles/{,*/}*.css',
          '<%= yeoman.app %>/vendor/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      },

      less: {
        files: '<%= yeoman.app %>/styles/{,*/}*.less',
        tasks: 'less-and-autoprefixer'
      }
    },

    connect: {
      options: {
        hostname: '0.0.0.0',
        port:      grunt.option('port') || 9013
      },

      livereload: {
        options: {
          middleware: function (connect) {
            return [
              lrSnippet,

              connect().use('/',                 connect.static(yeomanConfig.app)),
              connect().use('/bower_components', connect.static('./bower_components')),
              connect().use('/proxy/',           proxy())
            ];
          }
        }
      }
    },

    open: {
      server: {
        url: 'http://localhost:<%= connect.options.port %>'
      }
    },

    clean: {
      build: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= yeoman.dist %>'
          ]
        }]
      }
    },

    jshint: {
      options: {
        jshintrc: '.jshintrc',
        ignores:  [
          'test/spec/support/templates.js'
        ]
      },

      all: [
        'Gruntfile.js',
        '<%= yeoman.app %>/scripts/{,*/}*.js',
        'test/mock/{,*/}*.js',
        'test/spec/{,*/}*.js',
        'scenario/test/e2e/{,*/}*.js',
        'scenario/test/lib/{,*/}*.js',
        'scenario/support/{,*/}*.js'
      ]
    },

    useminPrepare: {
      options: {
        dest: '<%= yeoman.dist %>',
        flow: {
          post:  {},
          steps: {
            js:  [require('./tasks/copy_vendor'), 'concat'],
            css: [require('./tasks/copy_vendor'), 'concat']
          }
        }
      },

      html: '<%= yeoman.app %>/index.html'
    },

    usemin: {
      options: {
        dirs: ['<%= yeoman.dist %>']
      },

      html: '<%= yeoman.dist %>/index.html'
    },

    concat: {
      dist: {
        dest: '<%= yeoman.dist %>/scripts/main.js',
        src:  [
          '<%= yeoman.dist %>/scripts/main.js',
          '.tmp/templates.js'
        ]
      }
    },

    copy: {
      dist: {
        files: [
          {
            expand: true,
            cwd:    '<%= yeoman.app %>',
            src:    '*.html',
            dest:   '<%= yeoman.dist %>'
          },

          {
            expand: true,
            cwd:    '<%= yeoman.app %>/vendor/fonts',
            src:    '*',
            dest:   '<%= yeoman.dist %>/fonts'
          },

          {
            expand: true,
            cwd:    'bower_components/font-awesome/fonts',
            src:    '*',
            dest:   '<%= yeoman.dist %>/fonts'
          }
        ]
      }
    },

    karma: {
      unit: {
        configFile: 'karma.conf.js',
        singleRun:  true
      }
    },

    ngmin: {
      dist: {
        files: {
          '<%= yeoman.dist %>/scripts/main.js': '<%= yeoman.dist %>/scripts/main.js'
        }
      }
    },

    uglify: {
      dist: {
        files: {
          '<%= yeoman.dist %>/scripts/main.min.js':   '<%= yeoman.dist %>/scripts/main.js',
          '<%= yeoman.dist %>/scripts/vendor.min.js': '<%= yeoman.dist %>/scripts/vendor.js'
        }
      }
    },

    cssmin: {
      dist: {
        files: {
          '<%= yeoman.dist %>/styles/main.min.css':   '<%= yeoman.dist %>/styles/main.css',
          '<%= yeoman.dist %>/styles/vendor.min.css': '<%= yeoman.dist %>/styles/vendor.css'
        }
      }
    },

    ngtemplates: {
      options: {
        module: 'ramlEditorApp',
        base:   'app'
      },

      files: {
        cwd:  'app',
        src:  'views/**/*.html',
        dest: '.tmp/templates.js'
      }
    },

    less: {
      files: {
        expand:  true,
        flatten: true,
        src:     'app/styles/less/*.less',
        dest:    'app/styles',
        ext:     '.css'
      }
    },

    autoprefixer: {
      options: {
        browsers: ['last 2 versions']
      },

      app: {
        src: 'app/styles/*.css'
      }
    },

    protractor: {
      local: {
        configFile: 'scenario/support/local.conf.js'
      },

      scenario: {
        configFile: 'scenario/support/protractor.conf.js'
      },

      debug: {
        configFile: 'scenario/support/protractor.conf.js',
        debug:      true
      },

      saucelabs: {
        configFile: 'scenario/support/saucelabs.conf.js'
      }
    }
  });

  grunt.registerTask('jshint-once', (function jshintOnceFactory() {
    var jshinted = false;
    return function jshintOnce() {
      if (!jshinted) {
        jshinted = true;
        grunt.task.run('jshint');
      }
    };
  })());

  grunt.registerTask('less-and-autoprefixer', [
    'less',
    'autoprefixer'
  ]);

  grunt.registerTask('server', [
    'jshint-once',
    'less-and-autoprefixer',
    'connect:livereload',
    'watch'
  ]);

  grunt.registerTask('build', [
    'jshint-once',
    'clean:build',
    'useminPrepare',
    'less-and-autoprefixer',
    'ngtemplates',
    'concat:generated',
    'concat:dist',
    'copy:generated',
    'copy:dist',
    'ngmin',
    'uglify:dist',
    'cssmin:dist',
    'usemin'
  ]);

  grunt.registerTask('test', [
    'jshint-once',
    'ngtemplates',
    'karma'
  ]);

  grunt.registerTask('localScenario', [
    'jshint-once',
    'connect:livereload',
    'protractor:local'
  ]);

  grunt.registerTask('scenario', [
    'jshint-once',
    'protractor:scenario'
  ]);

  grunt.registerTask('saucelabs', [
    'jshint-once',
    'protractor:saucelabs'
  ]);

  grunt.registerTask('default', [
    'jshint-once',
    'test',
    'build'
  ]);
};
