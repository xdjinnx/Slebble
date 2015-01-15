var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    shell = require('gulp-shell'),
    stylish = require('jshint-stylish'),
    watch = require('gulp-watch'),
    mocha = require('gulp-mocha');

gulp.task('lint', function(){
  return gulp.src('./src/js/pebble-js-app.js')
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});

gulp.task('build', shell.task([
  'pebble build'
]));

gulp.task('mocha', function() {
  return gulp.src(['test/*.js'], { read: false })
    .pipe(mocha({ reporter: 'list' }));
});

gulp.task('watch-tests', function () {
  gulp.watch(['test/tests.js', 'src/js/*'], ['mocha']);
});

// define tasks here
gulp.task('default', ['lint', 'build']);
