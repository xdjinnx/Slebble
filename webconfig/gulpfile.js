/**
 *
 *  Web Starter Kit
 *  Copyright 2014 Google Inc. All rights reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License
 *
 */

'use strict';
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var runSequence = require('run-sequence');
var sass = require('gulp-sass');
var streamqueue = require('streamqueue');
var concat = require('gulp-concat');


// Lint JavaScript
gulp.task('jshint', function () {
  return gulp.src('js/slebble.js')
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'));
});

gulp.task('uglify', function(){
  return gulp.src(['js/main.js', 'js/slebble.js', 'bower_components/purl/purl.js'])
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
  runSequence(['uglify', 'sass', 'fonts'], cb);
});

// Load custom tasks from the `tasks` directory
try { require('require-dir')('tasks'); } catch (err) {}
