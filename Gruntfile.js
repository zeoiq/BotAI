// Gruntfile.js

// our wrapper function (required by grunt and its plugins)
// all configuration goes inside this function
module.exports = function(grunt) {

  // ===========================================================================
  // CONFIGURE GRUNT ===========================================================
  // ===========================================================================
  //require('load-grunt-tasks')(grunt);
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
    
  var pkg = grunt.file.readJSON('package.json');
  grunt.initConfig({
        pkg: pkg,        
      
        // JsHint
        jshint: {
            // JsHint configuration is read from packages.json
            options: pkg.jshintConfig,
            all: [
                'Gruntfile.js',
                'public_html/app/*.js',
                'public_html/app/**/*.js'
            ]
        },
      
        // Clean
        clean: {
            // clean:release removed the dist directory
            release: [ 'public' ]
        },
      
        // Less
        less: {
            dev: {
                src: 'public_html/assets/css/*.css',
                dest: 'public_html/assets/css/style.min.css'
            },
            release: {
                src: 'public_html/assets/css/style.min.css',
                dest: 'public/assets/css/style.min.css',
                options: {
                    compress: true
                }
            }
        },
      
        // take the processed style.css file and minify
        cssmin: {
          build: {
            files: {
              'public/assets/css/style.min.css': 'public/assets/css/style.min.css'
            }
          }
        }, 
      
        useminPrepare: {
          html: 'public_html/index.html',
          options: {
            dest: 'public'
          }
        },
      
        // Concat
        concat: {
            options: {
                separator: ';'
            },
            // dist configuration is provided by useminPrepare
            dist: {}
        },

        // Uglify
        uglify: {
            options: {
                mangle: true
            },
            // dist configuration is provided by useminPrepare
            dist: {}
        },

        // Copy HTML, images and fonts
        copy: {
            // copy:release copies all html and image files to dist
            // preserving the structure
            release: {
                files: [
                    {
                        expand: true,
                        cwd: 'public_html',
                        src: [
                            'assets/img/*.{png,gif,jpg,jpeg,svg,ico}',
                            '*.html',
                            'view/*.html',
                            'view/**/*.html'
                        ],
                        dest: 'public'
                    },
                    {expand: true, 
                     cwd: 'public_html/assets/js/bower_components/', 
                     src: ['**'], 
                     dest: 'public/assets/js/bower_components'},
                ]
            }
        },
      
        // Filerev
        filerev: {
            options: {
                encoding: 'utf8',
                algorithm: 'md5',
                length: 20
            },
            release: {
                // filerev:release hashes(md5) all assets (images, js and css )
                // in dist directory
                files: [{
                    src: [
                        //'public/assets/img/*.{jpg,jpeg,gif,png,svg}',
                        'public/js/*.js',
                        'public/assets/css/*.css',
                    ]
                }]
            }
        },
      
        usemin: {
            html: ['public/*.html'],
            css: ['public/assets/css/*.css'],
            options: {
                assetsDirs: ['public', 'public/assets/css']
            }
        },
      
        htmlmin: {                                     // Task
            dist: {                                      // Target
              options: {                                 // Target options
                removeComments: true,
                collapseWhitespace: true
              },
              files: {                                   // Dictionary of files
                'public/index.html': 'public/index.html'     // 'destination': 'source'
              } 
            }
        },
      
        /*obfuscator: {
            files: ['public_html/dist/js/app.min.js'],
            entry: 'app.min.js',
            out: 'public_html/dist/js/obfuscated.js',
            strings: true,
            root: __dirname
        }, */                   
        

        // COOL TASKS ==============================================================
        // watch css and js files and process the above tasks
        watch: {
          css: {
            files: ['public_html/assets/**/*.css'],
            tasks: ['less:dev']
          },
          js: {
            files: ['public_html/app/**/*.js'],
            tasks: ['jshint']
          }
        },
        // configure nodemon
        nodemon: {
            dev: {
                script: 'server.js'
            }
        },
      
        // run watch and nodemon at the same time
        concurrent: {
          options: {
            logConcurrentOutput: true
          },
          tasks: ['nodemon', 'watch']
        } 
    });

    // ===========================================================================
    // LOAD GRUNT PLUGINS ========================================================
    // ===========================================================================
    // we can only load these if they are in our package.json
    // make sure you have run npm install so our app can find these
    /*grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-usemin');
    grunt.loadNpmTasks('grunt-contrib-copy');    
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-filerev');    
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-concurrent'); */

    //grunt.registerTask('default', ['clean', 'jshint', 'useminPrepare', 'copy:generated', 'uglify', 'cssmin', 
    //                               'filerev', 'usemin']);
    
    // Invoked when grunt is called
    grunt.registerTask('default', 'Default task', [
        'jshint', 'less:dev', 'concurrent'
    ]);

    // Invoked with grunt release, creates a release structure
    grunt.registerTask('release', 'Creates a release in /dist', [
        'clean', 'jshint', 'less:release', 'cssmin', 'useminPrepare', 'concat', 'uglify',
        'copy', 'filerev', 'usemin', 'htmlmin'
    ]);
};