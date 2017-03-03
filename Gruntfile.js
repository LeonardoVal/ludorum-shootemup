module.exports = function(grunt) {
  var SOURCES = [
    'src/js/__prologue__.js',
    'src/js/boot.js',
		'src/js/preloader.js',
		'src/js/menu.js',
    'src/js/models/director.js',
		'src/js/models/stage.js',
		'src/js/models/gameObject.js',
		'src/js/models/actor.js',
		'src/js/models/mob.js',
		'src/js/models/shoot.js',
		'src/js/models/enemy.js',
		'src/js/models/flying_mobs.js',
		'src/js/models/turret.js',
		'src/js/models/player.js',
		'src/js/models/bullet.js',
		'src/js/models/collectible.js',
		'src/js/models/cloud.js',
    'src/js/controllers/stageController.js',
    'src/js/controllers/basicController.js',
    'src/js/controllers/playerController.js',
		'src/js/game.js',
		'src/js/main.js',
    'src/js/__epilogue__.js'];
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    copy: {
      main: {
        files: [
          {expand: true, cwd: "src/", src: ['assets/**'], dest: 'build/'},
          {expand: true, cwd: "src/", src: ['css/**'], dest: 'build/'},
          {expand: true, cwd: "src/", src: ['index.html'], dest: 'build/'},
          {expand: true, cwd: "node_modules/phaser/build/", src: ['phaser.js'], dest: 'build/js/'},
          {expand: true, cwd: "node_modules/phaser/build/", src: ['phaser.map'], dest: 'build/js/'},
          {expand: true, cwd: "node_modules/p2/build/", src: ['p2.js'], dest: 'build/js/'}
        ]
      }
    },
    concat: {
      options:{
        separator: '\n\n',
      },
      build:{
        src: SOURCES,
        dest: 'build/js/<%= pkg.name %>.js',
        nonull: true,
      }
    },
    jshint: {
      build: ['src/**/*.js', 'test/**/*.js']
    },
    uglify: {
      options: {
        banner: "",
      },
      build: {
        src: '<%= concat.build.dest %>',
        dest: 'build/js/<%= pkg.name %>.min.js'
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('compile', ['copy', 'concat', /*'jshint',*/ 'uglify']);
  grunt.registerTask('default', ['compile']);
}
