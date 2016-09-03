/* eslint strict: 0 */
var gulp = require('gulp'),
	shell = require('gulp-shell'),
	webpack = require('webpack-stream'),
	stripCode = require('gulp-strip-code'),
	eslint = require('gulp-eslint'),
	concat = require('gulp-concat');

gulp.task('webpack', ['lint'], function() {
	return gulp.src('./src/js/main.js')
		.pipe(webpack({
			output: {
				filename: 'pebble-js-app.js'
			}
		}))
		.pipe(gulp.dest('./src/js/build/'));
});

gulp.task('lint', function(){
	return gulp.src(['./src/js/*.js', '!./src/js/build/*'])
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(eslint.failAfterError());
});

gulp.task('strip', ['webpack'],function(){
	return gulp.src(['./src/js/build/pebble-js-app.js'])
		.pipe(stripCode({
			start_comment: "test-block",
			end_comment: "end-test-block"
		}))
		.pipe(gulp.dest('./src/js/build/'));
});

gulp.task('concat', ['strip'], function() {
	return gulp.src(['./src/js/build/pebble-js-app.js', './node_modules/trackjs/tracker.js'])
		.pipe(concat('pebble-js-app.js'))
		.pipe(gulp.dest('./src/js/build/'));
});

gulp.task('build', ['concat'], shell.task([
	'pebble build'
]));

// define tasks here
gulp.task('default', ['webpack', 'lint', 'strip', 'build']);
