const gulp = require('gulp')
const babel = require('gulp-babel')
const ts = require('gulp-typescript')
const merge2 = require('merge2')
const getProjectPath = require('./build/getProjectPath')
const getBabelCommonConfig = require('./build/getBabelCommonConfig')
const tsConfig = require('./build/getTSCommonConfig')()

const libDir = getProjectPath('lib')
const esDir = getProjectPath('es')

const tsDefaultReporter = ts.reporter.defaultReporter()

function babelify(js, useESModules) {
    const babelConfig = getBabelCommonConfig(useESModules)
    delete babelConfig.cacheDirectory

    const stream = js.pipe(babel(babelConfig))

    return stream.pipe(gulp.dest(useESModules ? esDir : libDir))
}

function compile(useESModules) {
    let error = 0

    const css = gulp
        .src(['src/**/*.css'])
        .pipe(gulp.dest(useESModules ? esDir : libDir))

    const tsResult = gulp.src([
        'src/**/*.tsx',
        'src/**/*.ts',
        'src/**/*.jsx',
        'src/**/*.js'
    ]).pipe(
        ts(tsConfig, {
            error(e) {
                tsDefaultReporter.error(e)
                error = 1
            },
            finish: tsDefaultReporter.finish
        })
    )

    function check() {
        if (error) {
            process.exit(1)
        }
    }

    tsResult.on('finish', check)
    tsResult.on('end', check)

    const tsFilesStream = babelify(tsResult.js, useESModules)
    const tsd = tsResult.dts.pipe(gulp.dest(useESModules ? esDir : libDir))

    return merge2([css, tsFilesStream, tsd])
}

function compileWithES(done) {
    compile(true).on('finish', done)
}

function compileWithLib(done) {
    compile(false).on('finish', done)
}

gulp.task('build', gulp.parallel(
    compileWithES,
    compileWithLib
))
