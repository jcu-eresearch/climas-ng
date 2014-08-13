
var gulp = require('gulp');
var gutil = require('gulp-util');

// this gulpfile uses gulp-load-plugins to load plugins, which saves
// having to load everything separately.
// info: https://github.com/jackfranklin/gulp-load-plugins
var plugins = require('gulp-load-plugins')();

// paths this project uses ==========================================

var path = require('path');

var cssSourcePaths = [
    'climasng/src/css/**/*.less',
    'climasng/src/css/**/*.css'
];
var coffeeSourcePaths = ['climasng/src/coffee/**/*.coffee'];
var jsRootPaths = ['climasng/src/js/page-*.js'];
var jsSourcePaths = ['climasng/src/js/**/*.js'];
var jsLintablePaths = jsSourcePaths.concat([
    'gulpfile.js'
]);
var oldCoffeeSourcePaths = ['climasng/src/js/oldreports/**/*.coffee'];

// utility functions ================================================

// returns a string consisting of prefix + filePath + postfix,
// with colour highlighting of the filepath.
function colorFileMsg(prefix, filePath, postfix) {
    // maybe a relative path is clearer..
    var nicePath = path.relative('.', filePath);
    if (nicePath.substr(0,2) === '..') {
        nicePath = filePath;
    }
    return (
        gutil.colors.gray(prefix + path.dirname(nicePath) + '/') +
        gutil.colors.magenta(path.basename(nicePath)) +
        gutil.colors.gray(postfix)
    );
}

// **returns a function** that when invoked with an event argument,
// logs a nice message saying that the event will be handled.
// Arg 'message' is what to say instead of "Handled" in the message.
function adviseOfEvent(message) {
    return (function(event) {
        var msg = message || 'Handling';
        gutil.log(colorFileMsg(msg + ' ', event.path, ' for you..'));
    });
}

// handles errors by logging and beeping, then returning 'end'
// see:  https://github.com/gulpjs/gulp/issues/259
function bail(error) {
    gutil.log(error);
    gutil.beep();
    this.emit('end');
}

// actual tasks =====================================================

// ----------------------------------------------------- default task
gulp.task('default', ['build', 'watch'], function() {
    console.log('Running the default task.');
    console.log('This will watch your files and do all the ' +
        'necessary compilation etc.');
    console.log(
        'If this is not what you expected, you should press ' +
        'Ctrl+c to quit this, then run "gulp tasks" to see ' +
        'what else you can do.'
    );
});

// --------------------------------------------- build ALL the things
gulp.task('build', ['cssbuild', 'coffeebuild', 'jsbuild', 'oldcsbuild']);

// ------------------------------------------------- lint your source
gulp.task('lint', ['jslint']);

// -------------------------------------------- react to file updates
gulp.task('watch', function() {
    gulp.watch(cssSourcePaths, ['cssbuild'])
        .on('change', adviseOfEvent('Building'));

    gulp.watch(jsLintablePaths, ['jslint'])
        .on('change', adviseOfEvent('Linting'));

    gulp.watch(jsSourcePaths, ['jsbuild'])
        .on('change', adviseOfEvent('Building'));

    gulp.watch(oldCoffeeSourcePaths, ['oldcsbuild'])
        .on('change', adviseOfEvent('Compiling'));

    gulp.watch(coffeeSourcePaths, ['coffeebuild'])
        .on('change', adviseOfEvent('Brewing'));
});

// ------------------------------------------------------ compile css
gulp.task('cssbuild', ['cssclean'], function() {
    return gulp.src(cssSourcePaths)
        .pipe(plugins.less())
        .on('error', bail)
        .pipe(plugins.autoprefixer("> 1%", "last 3 versions", "ie > 7", "ff > 20", "Opera 12.1"))
        .pipe(gulp.dest('climasng/static/css/'))
        .pipe(plugins.rename({suffix: '.min'}))
        .pipe(plugins.minifyCss())
        .pipe(gulp.dest('climasng/static/css/')) ;
});

// ------------------------------------------------- delete built css
gulp.task('cssclean', function() {
    return gulp.src(['climasng/static/css/*.css'], {read: false})
        .pipe(plugins.clean());
});

// ------------------------------------------------------- compile js
gulp.task('jsbuild', ['jsclean', 'jslint'], function() {
    return gulp.src(jsRootPaths)
        .pipe(plugins.browserify({
            debug: !gutil.env.production
        }))
        .on('error', bail)
        .pipe(gulp.dest('climasng/static/js/'))
        .pipe(plugins.rename({suffix: '.min'}))
        .pipe(plugins.uglify())
        .pipe(gulp.dest('climasng/static/js/')) ;
});

// ---------------------------------------------------------- lint js
gulp.task('jslint', function() {
    return gulp.src(jsLintablePaths)
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('default')) ;
});

// -------------------------------------------------- delete built js
gulp.task('jsclean', function() {
    return gulp.src(['climasng/static/js/**/*.js', '!climasng/static/js/oldreports/**'], {read: false})
        .pipe(plugins.clean()) ;
});

// --------------------------------------------- compile coffeescript
gulp.task('oldcsbuild', function() {
    return gulp.src(oldCoffeeSourcePaths)
        .pipe(plugins.coffee())
        .on('error', bail)
        .pipe(gulp.dest('climasng/static/js/oldreports/')) ;
});

// --------------------------------------------- compile coffeescript
gulp.task('coffeebuild', function() {
    return gulp.src(coffeeSourcePaths)
        .pipe(plugins.coffee())
        .on('error', bail)
        .pipe(gulp.dest('climasng/src/js/')) ;
});

// meta type tasks ==================================================

// --------------------------------------------- show available tasks
gulp.task('tasks', function() {

    var columnTitles = 'Available tasks:';
    var taskNames = Object.keys(gulp.tasks);

    var maxLen = taskNames.reduce(function(prev, current) {
        return Math.max(prev, current.length);
    }, columnTitles.length);

    columnTitles = columnTitles + Array(maxLen - columnTitles.length + 1).join(' ');
    columnTitles += '    Dependencies:';

    console.log(gutil.linefeed + columnTitles + gutil.linefeed);

    taskNames.forEach( function(taskName) {
        var task = gulp.tasks[taskName];
        var depList = '';
        if (task.dep.length > 0) {
            depList = Array(maxLen - taskName.length + 1).join(' ');
            depList = depList + task.dep.join(' + ');
        }
        console.log('    ' + taskName + depList);
    });
    console.log('\nexecute "gulp <taskname>" to perform a task ' +
        '(or just "gulp" to perform the \'default\' task).' +
        gutil.linefeed
    );
});

// -------------------------------------- show all the loaded plugins
gulp.task('plugins', function() {
    // just outputs your loaded plugins, are you using them all?
    console.log(gutil.linefeed + 'Available plugins:');
    Object.keys(plugins).forEach( function(pluginName) {
        console.log('    ' + pluginName);
    });
    console.log();
});

