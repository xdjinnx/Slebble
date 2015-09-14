var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    shell = require('gulp-shell'),
    stylish = require('jshint-stylish'),
    webpack = require('gulp-webpack'),
    stripCode = require('gulp-strip-code');

gulp.task('webpack', function() {
  return gulp.src('./src/js/main.js')
    .pipe(webpack({
      output: {
        filename: 'pebble-js-app.js'
      }
    }))
    .pipe(gulp.dest('./src/js/'));
});

gulp.task('lint', ['webpack'],function(){
  return gulp.src('./src/js/pebble-js-app.js')
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});

gulp.task('strip', ['webpack'],function(){
  return gulp.src(['./src/js/pebble-js-app.js'])
    .pipe(stripCode({
      start_comment: "test-block",
      end_comment: "end-test-block"
    }))
    .pipe(gulp.dest('./src/js'));
});

gulp.task('build', ['strip'], shell.task([
  'pebble build'
]));

// define tasks here
gulp.task('default', ['webpack', 'lint', 'strip', 'build']);
