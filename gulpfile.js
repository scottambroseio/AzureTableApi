var gulp = require('gulp');
var to5 = require('gulp-6to5');

gulp.task('compile', function () {
    return gulp.src('src/**/*.js')
        .pipe(to5())
        .pipe(gulp.dest('dist'));
});

gulp.task('watch', function () {
	gulp.watch(['src/**/*.js'], ['compile']);
});