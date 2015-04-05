var gulp = require('gulp'),
    coffee = require('gulp-coffee'),
    concat = require('gulp-concat'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify');

gulp.task('dist', function() {
  gulp.src('jquery.colorfy.coffee')
    .pipe(coffee({bare: false}))
    .pipe(gulp.dest('.'));
});

gulp.task('minify', ['dist'], function() {
  gulp.src('jquery.colorfy.js')
    .pipe(jshint())
    .pipe(uglify({preserveComments: 'some'}))
    .pipe(concat('jquery.colorfy.min.js'))
    .pipe(gulp.dest('.'));
});
