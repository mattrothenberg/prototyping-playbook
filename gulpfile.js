var gulp = require('gulp')
var uncss = require('gulp-uncss')
var shell = require('gulp-shell')

gulp.task('uncss', ['build'], function() {
  return gulp.src([
      'dist/assets/main.css',
    ])
    .pipe(uncss({
      html: [
        'dist/**/*.html'
      ],
      ignore: [/code/g, /pre/g, /^.token/]
    }))
    .pipe(gulp.dest('dist/assets', {overwrite: true}))
})
gulp.task('build', shell.task('JEKYLL_ENV=production jekyll build -d dist'))
gulp.task('deploy', ['uncss'], shell.task('gh-pages -d dist'))
