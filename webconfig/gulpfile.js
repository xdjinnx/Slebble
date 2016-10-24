
'use strict';
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var runSequence = require('run-sequence');
var sass = require('gulp-sass');
var streamqueue = require('streamqueue');
var concat = require('gulp-concat');
var babel = require('gulp-babel');
var webpack = require('webpack-stream');

gulp.task("babel", function () {
    return gulp.src('js/app.js')
        .pipe(babel())
        .pipe(gulp.dest('gae-root/webconfig/scripts'));
});

gulp.task('webpack', ['babel'], function() {
    return gulp.src('gae-root/webconfig/scripts/app.js')
        .pipe(webpack({
            output: {
                filename: 'app.js'
            }
        }))
        .pipe(gulp.dest('gae-root/webconfig/scripts'));
});

gulp.task('jshint', function () {
  return gulp.src('js/slebble.js')
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'));
});

gulp.task('uglify', function(){
  return gulp.src(['js/main.js', 'bower_components/purl/purl.js'])
    .pipe($.uglify())
    .pipe(gulp.dest('gae-root/webconfig/scripts'))
    .pipe($.size({title: 'js'}));
});

gulp.task('fonts', function () {
  return gulp.src(['./bower_components/google-web-starter-kit/app/fonts/**'])
    .pipe(gulp.dest('gae-root/webconfig/fonts'))
    .pipe($.size({title: 'fonts'}));
});

gulp.task('style', function () {
  return streamqueue({objectMode:true},
    gulp.src('./style/wsk.scss')
      .pipe(sass({
        'outputStyle':'compressed',
        'includePaths': ['./bower_components/google-web-starter-kit/app/styles/components']
      })),

    gulp.src('./style/slebble.scss')
      .pipe(sass({
        'outputStyle':'compressed'
      }))
      .pipe($.autoprefixer({
        browsers: ['last 2 versions'],
        cascade: false
      }))
    )
    .pipe(concat('slebble.css'))
    .pipe(gulp.dest('gae-root/webconfig/styles/'))
    .pipe($.size({title: 'css'}));
});

// Build Production Files, the Default Task
gulp.task('default', function (cb) {
  runSequence(['uglify', 'style', 'fonts', 'webpack'], cb);
});

// Load custom tasks from the `tasks` directory
try { require('require-dir')('tasks'); } catch (err) {}
