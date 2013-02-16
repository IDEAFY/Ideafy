 module.exports = function (grunt) {

  grunt.loadNpmTasks('grunt-requirejs');

  grunt.initConfig({

    requirejs : {
      compile : {
        options : {
          appDir : "public",
          baseUrl : "js/packages",
          mainConfigFile : 'public/js/build.js',
          dir : "appbuild",
          modules : [
            //setup a layer for each package
            {
              name:"main",
              include : ["body"]
            }
          ]
        }
      }
    },
  });
  grunt.registerTask("build", "requirejs");
};