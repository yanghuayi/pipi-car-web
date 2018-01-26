var gulp = require('gulp'),
  less = require('gulp-less'),
  autoprefixer = require('gulp-autoprefixer'),
  runSequence = require('run-sequence'),
  del = require('del'),
  concat = require('gulp-concat'),
  rename = require('gulp-rename');
var csso = require('gulp-csso');
var gutil = require('gulp-util');
var plumber = require('gulp-plumber');
var connect = require('gulp-connect');
var gulpCopy = require('gulp-file-copy');
var order = require('gulp-order');
var smushit = require('gulp-smushit');
var proxy = require('http-proxy-middleware');

function errrHandler(e) {
  // 控制台发声,错误时beep一下
  gutil.beep();
  gutil.log(e);
}

gulp.task('less', function () {
  return gulp.src('less/main.less')
    .pipe(plumber())
    .pipe(less())
    .pipe(csso())
    .pipe(autoprefixer({
      browsers: ['last 2 versions', 'Android >= 4.0'],
      cascade: true,
      remove: true
    }))
    .pipe(gulp.dest('dist/css'));
});


gulp.task('images', function () {
  return gulp.src('images/**/*')
  // .pipe(smushit({ verbose: true}))
    .pipe(gulp.dest('dist/images'))
});

gulp.task('clean', function () {
  return del(['dist/*', '!dist/.git'], {dot: true});
});

//使用connect启动一个Web服务器
gulp.task('connect', function () {
  connect.server({
    root: '',
    host: '192.168.6.239',
    livereload: true,
    port: 3000,
    middleware: function(connect, opt) {
      return [
        proxy('/api',  {
          target: 'http://monitor.mysirui.com/',
          pathRewrite: {'^/api' : '/'},
          changeOrigin:true
        }),
      ]
    }
  });
});

gulp.task('copy', function () {
  gulp
    .src([])
    .pipe(gulp.dest('js'));
});
gulp.task('copyFonts', function () {
  gulp
    .src(['fonts/*'])
    .pipe(gulp.dest('dist/fonts'));
});
gulp.task('html', function () {
  gulp.src('*.html')
    .pipe(connect.reload());
});

gulp.task('minifyjs', function () {
  return gulp.src('js/*.js')
    .pipe(order([
      'jquery.min.js',
      '*.js'
    ]))
    .pipe(concat('main.js'))    //合并所有js到main.js
    .pipe(gulp.dest('dist/js'))    //输出main.js到文件夹
    .pipe(gulp.dest('dist/js'));  //输出
});

// 构建任务
gulp.task('build', function (cb) {
  runSequence('clean', ['copy', 'copyFonts', 'less', 'images', 'minifyjs', 'connect', 'html'], cb);
});

gulp.task('watch', function () {
  gulp.watch('less/**/*.less', ['less', 'html']);
  gulp.watch('images/**/*.{png,jpg,gif}', ['images']);
  gulp.watch('js/*.js', ['minifyjs']);
  gulp.watch(['*.html'], ['html']);
});

gulp.task('default', ['build', 'watch']);
