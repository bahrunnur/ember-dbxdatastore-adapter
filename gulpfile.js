"use strict";

var gulp    = require('gulp');
var rename  = require('gulp-rename');
var uglify  = require('gulp-uglify');
var jasmine = require('gulp-jasmine');
var del     = require('del');

// Testing Task
gulp.task('test', function () {
  return gulp.src('spec/*.js')
    .pipe(jasmine());
});

gulp.task('clean', function (cb) {
  del('ember-dbxdatastore-adapter.min.js', cb)
});

// Build Task
gulp.task('build', ['clean'], function() {
  return gulp.src('ember-dbxdatastore-adapter.js')
    .pipe(uglify())
    .pipe(rename({ extname: '.min.js' }))
    .pipe(gulp.dest('./'));
});

gulp.task('default', ['test']);
