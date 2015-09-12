var gulp = require('gulp'),
    coffee = require('gulp-coffee'),
    babel = require('gulp-babel'),
    concat = require('gulp-concat'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify');
function minName(fileName) {
  return fileName.slice(0, fileName.length - 2) + "min.js";
}

gulp.task('minify', ['dist'], function() {
  ['jquery.colorfy.js', 'jquery.colorfy.markdown.js'].forEach(
    function(fileName){
      gulp.src(fileName)
        .pipe(jshint())
        .pipe(uglify({preserveComments: 'some'}))
        .pipe(concat(minName(fileName)))
        .pipe(gulp.dest('.'));
    }
  );
});

gulp.task('dist', function() {
  ['jquery.colorfy.es6'].forEach(function(fileName){
    gulp.src(fileName)
      .pipe(babel())
      .pipe(gulp.dest('.'));
  });
});
