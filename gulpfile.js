'use strict';

var gulp = require('gulp'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    plumber = require('gulp-plumber'), // 防止因錯誤而跳掉gulp，會秀出錯誤原因，比較好找原因
    connect = require('gulp-connect'), // 創建一個HttpServer並且能使用livereload
    del = require('del'), // 跟gulp-clean一樣也是清除檔案，但用法比較簡單
    wiredep = require('wiredep').stream;

var onError = function(err) {
  console.log(err); // 詳細錯誤訊息
  notify().write(err); // 簡易錯誤訊息
  this.emit('end'); // 中斷程序不往下走
}


// Styles
gulp.task('styles', function() {
  return gulp.src('src/styles/**/*')
    .pipe(plumber({
        errorHandler: onError
    }))
    .pipe(sass({
      style: 'compressed'/*,
      // errLogToConsole:true也可防止gulp崩潰但是就不會進onError
      errLogToConsole: false,
      // 防止出錯崩潰的方法2，但是他會繼續往下執行到完畢，讓人誤以為成功，此方法不優
      onError: function(err) {
        console.log(err.message);
        return notify().write(err.message);
      }
      */
    }))
    /*
    // 防止出錯崩潰的方法3
    .on('error', function(error) {
      console.log(error.toString());
      notify().write(error.toString());
      this.emit('end');
    })
    */
    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    //.pipe(gulp.dest('dist/styles'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(minifycss())
    .pipe(gulp.dest('dist/styles'))
    .pipe(notify({ message: 'Styles task complete' }))
    .pipe(connect.reload());
});


// Scripts
gulp.task('scripts', ['copyScripts'],function() {
  return gulp.src(['src/scripts/**/*.js', '!src/scripts/vendor/**/*'])
    .pipe(plumber({
        errorHandler: onError
    }))
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('default'))
    .pipe(concat('main.js'))
    //.pipe(gulp.dest('dist/scripts'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(uglify())
    .pipe(gulp.dest('dist/scripts'))
    .pipe(notify({ message: 'Scripts task complete' }));
    //.pipe(connect.reload());
});
// Copy Other Third-party Scripts 不醜化壓縮
gulp.task('copyScripts', function() {
  return gulp.src('src/scripts/vendor/**/*')
    .pipe(plumber({
        errorHandler: onError
    }))
    .pipe(gulp.dest('dist/scripts/vendor/'))
    .pipe(notify({ message: 'Copy scripts/vendor/ complete' }))
    .pipe(connect.reload());
});


// bower下載library
gulp.task('bower', function() {
  gulp.src('src/*.html')
    .pipe(wiredep({
        directory: 'src/scripts/vendor',
        ignorePath: 'src'
    }))
    .pipe(gulp.dest('src'));
});

// Images
gulp.task('images', function() {
  return gulp.src('src/images/**/*')
    .pipe(plumber({
        errorHandler: onError
    }))
    .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
    .pipe(gulp.dest('dist/images'))
    .pipe(notify({ message: 'Images task complete' }))
    .pipe(connect.reload());
});


// HTML
gulp.task('html', function() {
  return gulp.src('src/*')
    .pipe(plumber({
        errorHandler: onError
    }))
    .pipe(gulp.dest('dist/'))
    .pipe(notify({ message: 'Html task complete' }))
    .pipe(connect.reload());
});


// Clean
gulp.task('clean', function(cb) {
    del(['dist/styles', 'dist/scripts', 'dist/images', 'dist'], cb);
});


// livereload
gulp.task('connect', function() {
  connect.server({
    root: '',
    port: 8080,
    livereload: true
  });
});


// Default task
gulp.task('default', ['clean'], function() {
    gulp.start('styles', 'scripts', 'images', 'html', 'watch', 'connect');
});


// Watch
gulp.task('watch', function() {
  gulp.watch('bower.json', ['bower']);
  // Watch .scss files
  gulp.watch('src/styles/**/*', ['styles']).on('change', function(event) {
    // deleted, changed, added
    // 偵測有檔案刪除時就清空所有檔案，全部重新編譯過，缺點是如果檔案很多全部要重編譯理論上會比較久
    // 如果清除'dist/styles'資料夾有時候會壞掉，估計在判斷資料夾存在與否那邊有BUG
    // 所以這邊我選用只清除裡面檔案
    if(event.type == 'deleted') del(['dist/styles/**/*.*']);
    //console.log('File' + event.path + ' was ' + event.type + ', running tasks...');
  });
  // Watch .js files
  gulp.watch('src/scripts/**/*', ['scripts']).on('change', function(event) {
    if(event.type == 'deleted') del(['dist/scripts/**/*.*']);
  });
  // Watch image files
  gulp.watch('src/images/**/*', ['images']).on('change', function(event) {
    if(event.type == 'deleted') del(['dist/images/**/*.*']);
  });
  // Watch html files
  gulp.watch('src/*', ['html']).on('change', function(event) {
    if(event.type == 'deleted') del(['dist/*.*']);
  });
});