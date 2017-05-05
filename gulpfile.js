var gulp = require('gulp');
var uncss = require('gulp-uncss');

gulp.task('uncss', function() {
  return gulp.src([
      'dist/assets/main.css',
    ])
    .pipe(uncss({
      html: [
        'dist/**/*.html'
      ]
    }))
    .pipe(gulp.dest('dist/assets', {overwrite: true}));
});
