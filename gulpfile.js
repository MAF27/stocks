// Gulp Dependencies
var gulp = require('gulp');
var rename = require('gulp-rename');

// Build Dependencies
var browserify = require('browserify');
var watchify = require('watchify');
var uglify = require('gulp-uglify');
var source = require('vinyl-source-stream');

// Style Dependencies
var sass = require('gulp-sass');
var prefix = require('gulp-autoprefixer');
var minifyCSS = require('gulp-minify-css');

// Development Dependencies
var jshint = require('gulp-jshint');

// Test Dependencies
// var mochaPhantomjs = require('gulp-mocha-phantomjs');

// Browserify Watchify Setup
var bundler = browserify({
	// Required watchify args
	cache: {},
	packageCache: {},
	fullPaths: true,
	// Browserify options
	entries: ['client/app.js'],
	debug: true
});

var handleErrors = function(e) {
	console.log('Encountered error');
	console.error(e);
};

var bundle = function() {
	return bundler
		.bundle()
		.on('error', handleErrors)
		.pipe(source('app.js'))
		.pipe(gulp.dest('build'))
		.pipe(gulp.dest('public/javascripts'));
};

// GULP TASKS
gulp.task('lint-client', function() {
	return gulp.src('client/app.js')
		.pipe(jshint())
		.pipe(jshint.reporter('default'));
});

// gulp.task('lint-test', function() {
// 	return gulp.src('./test/**/*.js')
// 		.pipe(jshint())
// 		.pipe(jshint.reporter('default'));
// });

gulp.task('browserify', ['lint-client'], function() {
	return bundle();
});

// gulp.task('browserify-test', ['lint-test'], function() {
// 	return bundler
// 		.bundle()
// 		.on('error', handleErrors)
// 		.pipe(source('test-bundle.js'))
// 		.pipe(gulp.dest('build'));
// });

// gulp.task('test', ['lint-test', 'browserify-test'], function() {
// 	return gulp.src('test/client/index.html')
// 		.pipe(mochaPhantomjs());
// });

gulp.task('styles', function() {
	return gulp.src('client/sass/index.scss')
		.pipe(sass())
		.pipe(prefix({
			cascade: true
		}))
		.pipe(rename('styles.css'))
		.pipe(gulp.dest('build'))
		.pipe(gulp.dest('public/stylesheets'));
});

gulp.task('minify', ['styles'], function() {
	return gulp.src('build/styles.css')
		.pipe(minifyCSS())
		.pipe(rename('styles.min.css'))
		.pipe(gulp.dest('public/stylesheets'));
});

gulp.task('uglify', ['browserify'], function() {
	return gulp.src('build/app.js')
		.pipe(uglify())
		.pipe(rename('app.min.js'))
		.pipe(gulp.dest('public/javascripts'));
});

gulp.task('build', ['uglify', 'minify']);

gulp.task('default', ['build', 'watch']);
// gulp.task('default', ['test', 'build', 'watch']);

// WATCHING
gulp.task('watch', function() {
	var watchifyBundler = watchify(bundler);
	watchifyBundler.on('update', bundle);
	watchifyBundler.on('log', function(msg) {
		console.log(msg);
	});
	gulp.watch('client/sass/index.scss', ['styles']);
	return bundle();
});

//
// gulp.task('watch', function() {
// 	gulp.watch('client/**/*.js', ['browserify-client', 'test']);
// 	gulp.watch('test/client/**/*.js', ['test']);
// });
