"use strict";

var fs = require("fs");
var walk = require("walk");
var path = require("path");
var async = require("async");
var fsPath = require("fs-path");

module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    browserify: {
      dist: {
        options: {
          browserifyOptions: {
            debug: true
          },
          transform: [
            ["babelify", { compact: false }]
          ]
        },
        files: {
          "public/js/app.js": ["client/angularApp/index.js"]
        }
      }
    },
    clean: {
      default: [
        "public/*"
      ],
      dev: [
        "public/*"
      ],
      prod: [
        "public/*"
      ]
    },
    less: {
      dev: {
        options: {
          sourceMap: true
        },
        files: {
          "public/css/app.css": ["client/less/index.less"]
        }
      }
    },
    cssmin: {
      prod: {
        options: {
          sourceMap: false,
          keepSpecialComments: 0
        },
        files: {
          "public/css/app.css": ["public/css/app.css"]
        }
      }
    },
    // Copy web assets from bower_components to more convenient directories.
    copy: {
      default: {
        files: [
          {
          // fonts.
            expand: true,
            filter: "isFile",
            flatten: true,
            cwd: "client/",
            src: ["fonts/**"],
            dest: "public/fonts/"
          }, {
          // images
            expand: true,
            filter: "isFile",
            flatten: true,
            cwd: "client/",
            src: ["images/**"],
            dest: "public/images/"
          }
        ]
      }
    },
    uglify: {
      minify: {
        options: {
          sourceMap: false,
          mangle: true
        },
        files: {
          "public/js/app.js": ["public/js/app.js"]
        }
      }
    },
    ngAnnotate: {
      options: {
      },
      app: {
        files: {
          "public/js/app.js": ["public/js/app.js"]
        }
      }
    },
    pug: {
      compile: {
        options: {
          client: false,
          pretty: true
        },
        files: [{
          cwd: "client/angularApp/components",
          src: "**/*.jade",
          dest: "./client/angularApp/components",
          expand: true,
          ext: ".html.js"
        }]
      }
    },
    compileAngularTemplates: {
      components: {
        cwd: "./client/js/angularApp/components",
        sourceExt: "html",
        destExt: "html.js",
        dest: "client/js/crmApp/components"
      }
    }
  });

  grunt.loadNpmTasks("grunt-ng-annotate");
  grunt.loadNpmTasks("grunt-browserify");
  grunt.loadNpmTasks("grunt-contrib-clean");
  grunt.loadNpmTasks("grunt-contrib-cssmin");
  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.loadNpmTasks("grunt-contrib-less");
  grunt.loadNpmTasks("grunt-contrib-pug");
  grunt.loadNpmTasks("grunt-contrib-uglify");

  for(var key in grunt.config("compileAngularTemplates")) {
    registerCompileAngularTemplateTask(grunt, key);
  }
  grunt.registerTask("compileAngularTemplates", ["compileAngularTemplates:components"]);
  grunt.registerTask("compile", [
    "copy",
    "less",
    "pug",
    "compileAngularTemplates",
    "browserify",
    "ngAnnotate"
  ]);
  grunt.registerTask("default", [
    "clean:default",
    "compile"
  ]);
  grunt.registerTask("dev", ["clean:dev", "compile"]);
  grunt.registerTask("prod", ["clean:dev", "compile", "cssmin:prod", "uglify:minify"]);
};

function registerCompileAngularTemplateTask(grunt, task) {
  console.log(task);
  grunt.task.registerTask("compileAngularTemplates:" + task, function() {
    compileAngularTemplates.call(this, grunt.config("compileAngularTemplates")[task]);
  });
}

function compileAngularTemplates(config) {
  var done = this.async();
  var fileNameRegExpStr = ".+\." + config.sourceExt.replace(".", "\.") + "$";
  var fileNameRegExp =  new RegExp(fileNameRegExpStr);
  var rootDest = config.dest;
  var cwd = config.cwd;
  var walker = walk.walk(config.cwd, {followLinks: false});
  walker.on("file", function(root, stat, next) {
    if(!fileNameRegExp.test(stat.name)) {
      next();
    } else {

      var dest = path.resolve(root.replace(cwd, rootDest));
      convertHtmlToJs(root, dest, stat, next);
    }
  });
  walker.on("errors", function(root, nodeStatsArray, next) {
    nodeStatsArray.forEach(function (n) {
      console.error("[ERROR] " + n.name);
      console.error(n.error.message || (n.error.code + ": " + n.error.path));
    });
    next(false);
  });
  walker.on("end", done);
}

// ONLY FOR ES6 (like I'm going to use something other, yeah)
function convertHtmlToJs(root, dest, stat, callback) {
  var sourcePath = path.resolve(root, stat.name);
  var destPath = path.resolve(dest, stat.name + ".js");
  async.waterfall([
    function(next) {
      fs.readFile(sourcePath, "utf8", next);
    }, function(html, next) {
      var file = "export default function() {return `" + html + "`;}";
      fsPath.writeFile(destPath , file, next);
    }
  ], function(err) {
    callback(err);
  });
}
