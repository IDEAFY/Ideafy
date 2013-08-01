 module.exports = function (grunt) {

  grunt.loadNpmTasks('grunt-requirejs');

  grunt.initConfig({

    requirejs : {
      compile : {
        options : {
          appDir : "public/",
          baseUrl : "js-default/packages",
          mainConfigFile : 'public/js-default/build.js',
          dir : "www-build",
          modules : [
            //setup a layer for each package
            {
              name:"main"
            }
          ]
        }
      }
    }
  });
  grunt.registerTask("build", "requirejs");
};