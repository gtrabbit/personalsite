module.exports = function(grunt) {
  grunt.initConfig({
    postcss: {
      options: {
        processirs: [
        require('autoprefixer')()
        ]

      },
      dist: {
        src: '../portfolio/css/main.css',
        dest: '../portfolio/css/processed/main.css'
      }
    }
  })

  grunt.loadNpmTasks('grunt-postcss');
 

}