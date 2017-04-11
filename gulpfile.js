// Imports
var gulp = require('gulp');
var clean = require('gulp-clean');
var ts = require('gulp-typescript');
var rename = require("gulp-rename");
var sequence = require('run-sequence');
var watch = require('gulp-watch');
var tslint = require('gulp-tslint');

// Compiles typescript files
gulp.task('compile:ts.dev', function () {
    return gulp
        .src(["./src/**/*.ts"], { base: './src' })
        .pipe(ts({ module: 'commonjs', target: 'es6', noImplicitAny: false, allowJs: true, allowUnreachableCode: true }))
        .pipe(gulp.dest('./dist'));
});

// Removes compiled js files
gulp.task('clean:js', function () {
    return gulp
        .src([
            '!./src/public/**/*.js',
            './dist',
            './src/**/*.js',
        ], { read: false })
        .pipe(clean())
});


// Removes compiled js files
gulp.task('clean:dist', function () {
    return gulp
        .src([
            './dist'
        ], { read: false })
        .pipe(clean())
});


// Copies 'package.json' file to build directory
gulp.task('copy:package.json', function () {
    return gulp
        .src('./package.json')
        .pipe(gulp.dest('./dist'));
});

// Copies 'views' directory to build directory
gulp.task('copy:views', function () {
    return gulp
        .src([
            './src/views/**',
        ])
        .pipe(gulp.dest('./dist/views'));
});

// Copies 'public' directory to build directory
gulp.task('copy:public', function () {
    return gulp
        .src([
            './src/public/**'
        ])
        .pipe(gulp.dest('./dist/public'));
});


// Compiles typescript files
gulp.task('compile:ts.prod', function () {
    return gulp
        .src(["./src/**/*.ts"], { base: './src' })
        .pipe(ts({ module: 'commonjs', target: 'es6', noImplicitAny: false, allowJs: true, allowUnreachableCode: true }))
        .pipe(gulp.dest('./dist'));
});

// Renames config file
gulp.task('rename:config', function () {
    return gulp.src('./dist/config.prod.js', { base: process.cwd() })
        .pipe(rename('config.js'))
        .pipe(gulp.dest('./dist'));
});

gulp.task("tslint", () =>
    gulp.src("./src/**/*.ts")
        .pipe(tslint({
            extends: "tslint:latest",
            formatter: "verbose"
        }))
        .pipe(tslint.report())
);

gulp.task('build:dev', function (done) {
    sequence('clean:js', 'compile:ts.dev', 'copy:views', 'copy:public', done);
});

gulp.task('build:prod', function (done) {
    sequence('clean:dist', 'compile:ts.prod', 'copy:package.json', 'copy:views', 'copy:public', 'rename:config', done);
});

gulp.task('watch', ['build:dev'], function () {
    return watch('./src/**/*.ts', function () {
        gulp.start('build:dev');
    });
});