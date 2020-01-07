'use strict';

var gulp = require('gulp'),
	plugins = require('gulp-load-plugins')({
		DEBUG: true,
		rename: {

		}
	}),
	del = require('del'),
	runSequence = require('run-sequence'),
	jshintStylish = require('jshint-stylish'),
	scssCompiler = require('gulp-scss');

var src = './src/';
var dest = './www/';
var server = plugins.liveServer.static(dest, 8888);

gulp.task('clean', function(cb) {
	return del([dest], cb);
});

gulp.task('scss', function () {
	return gulp.src([src + 'scss/main.scss'])
	.pipe(scssCompiler())
	.pipe(plugins.sourcemaps.init())
	.pipe(plugins.autoprefixer({ browsers: ['last 2 versions'] }))
	.pipe(plugins.concat('styles.css'))
	.pipe(plugins.cssmin())
	.pipe(plugins.rename({
		suffix: '.min'
	}))
	.pipe(plugins.sourcemaps.write('.'))
	.pipe(gulp.dest(dest + 'css'));
});

gulp.task('js', function () {
	return gulp.src([src + 'js/**/*.js'])
	.pipe(plugins.jshint())
	.pipe(plugins.jshint.reporter(jshintStylish, {beep: true}))
	.pipe(plugins.concat('app.js'))
	.pipe(plugins.minify())
	.pipe(plugins.rename({
		suffix: '.min'
	}))
	.pipe(gulp.dest(dest + 'js'));
});

gulp.task('copy-html', function () {
	return gulp.src([src + '/**/*.html', src + '/**/*.htm'])
	.pipe(gulp.dest(dest));
});

gulp.task('copy-data', function(){
	return gulp.src([src + 'data/**/*.*'])
	.pipe(gulp.dest(dest + 'data'));
});

gulp.task('copy-assets', function(){
	return gulp.src([src + 'assets/**/*.*'])
	.pipe(gulp.dest(dest + 'assets'));
});

gulp.task('build', function(){
	return runSequence( 'clean', ['scss', 'js'], ['copy-html', 'copy-data', 'copy-assets'], function(){
		console.log('build complete...');
	});
});

gulp.task('serve', function() {

	runSequence( 'build', function(){

		server.start();

		gulp.watch([src + '/**/*.html'], function (file) {
			runSequence('copy-html', function(){
				console.log('HTML modified...!!! UPDATING...');
				server.notify.apply(server, [file]);
			});
		});

		gulp.watch([src + 'scss/**/*.scss'], function(file){
			runSequence('scss', function(){
				console.log('SCSS modified...!!! UPDATING...');
				server.notify.apply(server, [file]);
			});
		});

		gulp.watch([src + 'js/**/*.js'], function(file){
			runSequence('js', function(){
				console.log('JavaScript file modified...!!! UPDATING...');
				server.notify.apply(server, [file]);
			});
		})
	});
});

gulp.task('default', ['serve']);
