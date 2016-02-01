/*global -$ */
'use strict';
// generated on 2015-05-19 using generator-gulp-webapp 0.3.0
var gulp = require('gulp');
var $ = require('gulp-load-plugins')({lazy: false});
// console.log(JSON.stringify($));
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var argv = require('yargs').argv;
var pngquant = require('imagemin-pngquant');

//default settings......
var buildLocation = 'dist/html/'; //by default the files are published to this folder
var projectFolderSrc = 'default'; //this is the project source folder.......
var projectDest = 'default'; //where the content is copied to......
var tracking = "html"; //by default the tracking is html and not scorm
var bookmarking = "";
var debug = 'false';

gulp.task('content', ['settings', 'content-html', 'content-css', 'content-images', 'content-mindata', 'content-editdata']);

gulp.task('settings', function () {
  if(argv.project){
    projectFolderSrc = argv.project;
  }
  if(argv.p){
    projectFolderSrc = argv.p;
  }
  //
  if(argv.scorm){
    buildLocation = 'dist/scorm/';
    tracking = "scorm";
    bookmarking = "true";
  }
  //
  if(argv.debug){
    debug = "true";
  }
  console.log('projectFolderSrc set to', projectFolderSrc);
  console.log('tracking set to', tracking);
  console.log('debug set to', debug);
});

gulp.task('content-html', ['settings'], function () {
  return gulp.src('app/content/' + projectFolderSrc + '/**/*.html')
    .pipe($.minifyInlineScripts())
    // .pipe($.if('*.html', $.minifyHtml({conditionals: true, loose: true})))
    .pipe(gulp.dest(buildLocation+'content/'+projectDest+'/'));
});
gulp.task('content-css', ['settings'], function () {
    return gulp.src(['app/content/' + projectFolderSrc + '/**/*.css'])
        .pipe($.csso())
        .pipe(gulp.dest(buildLocation+'content/'+projectDest+'/'));
});
gulp.task('content-mindata', ['settings'], function () {
    return gulp.src(['app/content/' + projectFolderSrc + '/data/**/*.json'])
        .pipe($.jsonminify())
        .pipe(gulp.dest(buildLocation+'content/'+projectDest+'/data/'));
});
gulp.task('content-editdata', ['content-mindata'], function () {
  return gulp.src(buildLocation+'content/' + projectDest + '/data/app.json')
    .pipe($.jsonEditor(function(json){
      json.tracking = tracking;
      json.bookmarking = bookmarking;
      json.debug = debug;
      return json;
    }))
    .pipe($.jsonminify())
    .pipe(gulp.dest(buildLocation+'content/'+projectDest+'/data/'));
});
gulp.task('content-images', ['settings'], function () {
  return gulp.src('app/content/' + projectFolderSrc + '/images/**/*')
    // .pipe($.cache($.imagemin({
    //   progressive: true,
    //   interlaced: true,
    //   // don't remove IDs from SVGs, they are often used
    //   // as hooks for embedding and styling
    //   svgoPlugins: [{cleanupIDs: false}]
    // })))
    .pipe(gulp.dest(buildLocation+'content/'+projectDest+'/images/'));
});


gulp.task('styles', function () {
  return gulp.src('app/styles/*.scss')
    .pipe($.sourcemaps.init())
    .pipe($.sass({
      outputStyle: 'nested', // libsass doesn't support expanded yet
      precision: 10,
      includePaths: ['.'],
      onError: console.error.bind(console, 'Sass error:')
    }))
    .pipe($.postcss([
      require('autoprefixer-core')({browsers: ['last 1 version']})
    ]))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('.tmp/styles'))
    .pipe(reload({stream: true}));
});

gulp.task('jshint', function () {
  return gulp.src('app/scripts/**/*.js')
    .pipe(reload({stream: true, once: true}))
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.if(!browserSync.active, $.jshint.reporter('fail')));
});

gulp.task('html', ['styles', 'content'], function () {
  var assets = $.useref.assets({searchPath: ['.tmp', 'app', '.']});

  return gulp.src('app/*.html')
    .pipe(assets)
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.csso()))
    .pipe(assets.restore())
    .pipe($.useref())
    .pipe($.if('*.html', $.minifyHtml({conditionals: true, loose: true})))
    .pipe(gulp.dest(buildLocation));
});

gulp.task('images', function () {
  return gulp.src('app/images/**/*')
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true,
      // don't remove IDs from SVGs, they are often used
      // as hooks for embedding and styling
      svgoPlugins: [{cleanupIDs: false}]
    })))
    .pipe(gulp.dest(buildLocation+'images'));
});

gulp.task('fonts', function () {
  return gulp.src(require('main-bower-files')({
    filter: '**/*.{eot,svg,ttf,woff,woff2}'
  }).concat('app/fonts/**/*'))
    .pipe(gulp.dest('.tmp/fonts'))
    .pipe(gulp.dest(buildLocation+'fonts'));
});

gulp.task('extras', function () {
  return gulp.src([
    'app/*.*',
    '!app/*.html'
  ], {
    dot: true
  }).pipe(gulp.dest(buildLocation));
});

gulp.task('clean', require('del').bind(null, ['.tmp', 'dist']));

gulp.task('serve', ['settings', 'styles', 'content', 'fonts'], function () {
  browserSync({
    notify: false,
    port: 9000,
    startPath: '#'+projectFolderSrc+'/',
    server: {
      baseDir: ['.tmp', 'app'],
      routes: {
        '/bower_components': 'bower_components'
      }
    }
  });

  // watch for changes
  gulp.watch([
    'app/*.html',
    'app/scripts/**/*.js',
    'app/images/**/*',
    '.tmp/fonts/**/*'
  ]).on('change', reload);

  gulp.watch('app/styles/**/*.scss', ['styles']);
  gulp.watch('app/fonts/**/*', ['fonts']);
  gulp.watch('bower.json', ['wiredep', 'fonts']);
});

// inject bower components
gulp.task('wiredep', function () {
  var wiredep = require('wiredep').stream;

  gulp.src('app/styles/*.scss')
    .pipe(wiredep({
      ignorePath: /^(\.\.\/)+/
    }))
    .pipe(gulp.dest('app/styles'));

  gulp.src('app/*.html')
    .pipe(wiredep({
      ignorePath: /^(\.\.\/)*\.\./
    }))
    .pipe(gulp.dest('app'));
});

gulp.task('build', ['settings', 'jshint', 'html', 'images', 'fonts', 'extras'], function () {
  return gulp.src(buildLocation+'**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('default', ['clean'], function () {
  gulp.start('build');
});
