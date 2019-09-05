const gulp = require('gulp');
const babel = require('gulp-babel'); // ES6编译成ES5
const del = require('del');

gulp.task('es6', function () {
    console.log('gulp-es6');
    gulp.src('./index.js')
        .pipe(babel())
        .pipe(gulp.dest('./dist/'));

    gulp.src('./src/**/*.js')
        .pipe(babel())
        .pipe(gulp.dest('./dist/src/'));

    gulp.src('./config/**/*.js')
        .pipe(babel())
        .pipe(gulp.dest('./dist/config/'));

    gulp.src('./tranform-bind-data-conifg.js')
        .pipe(babel())
        .pipe(gulp.dest('./dist/'));

    gulp.src('./bin/cli.js')
        .pipe(babel())
        .pipe(gulp.dest('./dist/bin/'));
});

gulp.task('copy', function () {
    gulp.src('./package.json')
        .pipe(gulp.dest('./dist/'));

    gulp.src('./pkginfo.json')
        .pipe(gulp.dest('./dist/'));
});

gulp.task('clean', function () {
    del.sync(['./dist/**']);
});

gulp.task('build', ['clean'], function () {
    gulp.start('copy', 'es6');
});
