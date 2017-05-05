var gulp = require('gulp');
var uncss = require('gulp-uncss');

gulp.task('uncss', function() {
  return gulp.src([
      'dist/assets/main.css',
    ])
    .pipe(uncss({
      html: [
        'dist/**/*.html'
      ],
      ignore: [/code/g, /pre/g, /^.token/]
    }))
    .pipe(gulp.dest('dist/assets', {overwrite: true}));
});
