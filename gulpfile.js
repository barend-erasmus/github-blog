// Imports
var gulp = require('gulp');
var clean = require('gulp-clean');
var ts = require('gulp-typescript');
var rename = require("gulp-rename");
var sequence = require('run-sequence');
var tslint = require('gulp-tslint');

// Compiles typescript files
gulp.task('compile:ts.dev', function () {
    return gulp
        .src(["./src/**/*.ts"], { base: './src' })
        .pipe(ts({ module: 'commonjs', target: 'es6', noImplicitAny: false }))
        .pipe(gulp.dest('./dist'));
});

// Compiles typescript files
gulp.task('compile:ts.prod', function () {
    return gulp
        .src(["./src/**/*.ts"], { base: './src' })
        .pipe(ts({ module: 'commonjs', target: 'es6', noImplicitAny: false }))
        .pipe(gulp.dest('./dist'));
});


// Removes compiled files
gulp.task('clean', function () {
    return gulp
        .src([
            '!./src/public/**/*.js',
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


gulp.task("tslint", () =>
    gulp.src("./src/**/*.ts")
        .pipe(tslint())
        .pipe(tslint.report())
);

gulp.task('build:dev', function (done) {
    sequence('clean', 'compile:ts.prod', 'copy:package.json', 'copy:views', 'copy:public', done);
});

gulp.task('build:prod', function (done) {
    sequence('clean', 'compile:ts.prod', 'copy:package.json', 'copy:views', 'copy:public', done);
});
