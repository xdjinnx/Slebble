var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    shell = require('gulp-shell'),
    stylish = require('jshint-stylish'),
    webpack = require('gulp-webpack');

gulp.task('webpack', ['lint'], function() {
  return gulp.src('./src/js/main.js')
    .pipe(webpack({
      output: {
        filename: 'pebble-js-app.js'
      }
    }))
    .pipe(gulp.dest('./src/js/'));
});

gulp.task('lint', function(){
  return gulp.src('./src/js/pebble-js-app.js')
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});

gulp.task('build', ['webpack'], shell.task([
  'pebble build'
]));

// define tasks here
gulp.task('default', ['webpack', 'lint', 'build']);
