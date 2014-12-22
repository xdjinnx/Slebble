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

// Include Gulp & Tools We'll Use
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
//var del = require('del');
var runSequence = require('run-sequence');
var pagespeed = require('psi');
var sass = require('gulp-sass');

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

// Copy Web Fonts To Dist
//gulp.task('fonts', function () {
//  return gulp.src(['app/fonts/**'])
//    .pipe(gulp.dest('dist/fonts'))
//    .pipe($.size({title: 'fonts'}));
//});

gulp.task('sass', function () {
  return gulp.src('scss/slebble.scss')
    .pipe(sass())
    .pipe(gulp.dest('gae-root/webconfig/styles/'))
    .pipe($.size({title: 'css'}));
});

// Clean Output Directory
//gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

// Build Production Files, the Default Task
gulp.task('default', function (cb) {
  runSequence(['jshint', 'uglify', 'sass'], cb);
});

// Run PageSpeed Insights
// Update `url` below to the public URL for your site
//gulp.task('pagespeed', pagespeed.bind(null, {
//  // By default, we use the PageSpeed Insights
//  // free (no API key) tier. You can use a Google
//  // Developer API key if you have one. See
//  // http://goo.gl/RkN0vE for info key: 'YOUR_API_KEY'
//  url: 'https://example.com',
//  strategy: 'mobile'
//}));

// Load custom tasks from the `tasks` directory
try { require('require-dir')('tasks'); } catch (err) {}
