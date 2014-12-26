var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    shell = require('gulp-shell'),
    stylish = require('jshint-stylish');

gulp.task('lint', function(){
  return gulp.src('./src/js/pebble-js-app.js')
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});

gulp.task('build', shell.task([
  'pebble build'
]));

// define tasks here
gulp.task('default', ['lint', 'build']);
