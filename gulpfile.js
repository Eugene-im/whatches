// Create gulp
// Variables for the build and working folder
let project_folder  = "build",
    source_folder   = "src";

// The sequence of connecting styles
const stylePath = [
    source_folder + "/scss/**/normalize.scss",
    source_folder + "/scss/**/fonts.scss", 
    source_folder + "/scss/**/main.scss", 
    source_folder + "/scss/**/*.css",
    source_folder + "/scss/**/*.scss"
]
// The sequence of connecting scripts
const scriptPath = [
    source_folder + "/js/**/main.js",
    source_folder + "/js/**/*.js",
]

// Paths
let path = {
    build: {
        html:project_folder + "/",
        css:project_folder + "/css/",
        js:project_folder + "/js/",
        img:project_folder + "/img/",
        fonts:project_folder + "/fonts/",
    },
    src: {
        html:[source_folder + "/*.html", "!" + source_folder + "/_*.html"],
        css: stylePath,
        js: scriptPath,
        img:source_folder + "/img/**/*.{jpg,JPG,png,svg,ico,webp}",
        fonts:source_folder + "/fonts/*.ttf",
    },
    watch: {
        html:source_folder + "/**/*.html",
        css:source_folder + "/scss/**/*.scss",
        js:source_folder + "/js/**/*.js",
        img:source_folder + "/img/**/*.{jpg,png,svg,ico,webp}",
    },
    clean: "./" + project_folder +"/"
}

const { src, dest } = require('gulp'),
    gulp           = require('gulp'), 
    babel          = require('gulp-babel'),                     // Crossbrowser JS
    concat         = require("gulp-concat"),                    // Combining files
    autoprefixer   = require('gulp-autoprefixer'),              // Prefixes
    htmlmin        = require("gulp-htmlmin"),                   // html optimization
    clean_css      = require('gulp-clean-css'),                 // Style Optimization
    uglify         = require('gulp-uglify-es').default,         // Script optimization
    del            = require('del'),                            // Deleting files
    browsersync    = require('browser-sync').create(),          // Browser Synchronization
    sourcemaps     = require("gulp-sourcemaps"),                // View uncompressed code in dev tools
    scss           = require('gulp-sass')(require('sass')),                      // Sass preprocessor
    imagemin       = require('gulp-imagemin'),                  // Image Compression
    jpegrecompress = require("imagemin-jpeg-recompress"),       // jpeg compression
    pngquant       = require("imagemin-pngquant"),              // png compression
    webp           = require('gulp-webp'),                      // Convert to webp
    webphtml       = require('gulp-webp-html'),                 // Converts an img tag to a picture construct
    rename         = require('gulp-rename'),                    // Renaming files
    rev            = require('gulp-rev'),
    revDel         = require('rev-del'),
    revdel_origin  = require('gulp-rev-delete-original'),
    group_media    = require('gulp-group-css-media-queries'),   // Combining media queries
    plumber        = require("gulp-plumber"),                   // Finding bugs
    notify         = require("gulp-notify"),                    // Error output
    cache          = require("gulp-cache"),                     // caching module
    bourbon        = require("node-bourbon"),                   // bourbon mixin module
    ttf2woff       = require('gulp-ttf2woff'),                  // Convert from ttf2 to woff
    ttf2woff2      = require('gulp-ttf2woff2'),                 // Convert from ttf2 to woff2
    fonter         = require('gulp-fonter'),                    // Convert fonts
    fileinclude    = require('gulp-file-include');              // Template engine for html


function browserSync(params) {
    browsersync.init({
        server:{
            baseDir: "./" + project_folder +"/"
        },
        port:3000,
        notify: false
    })
};

function html() {
    return src(path.src.html)
        //Collecting html files
        .pipe(fileinclude())
        .pipe(htmlmin({ 
            collapseWhitespace: true,
            removeComments:true 
        }))
        .pipe(webphtml())
        .pipe(dest(path.build.html))
        .pipe(browsersync.stream())
}

function css() {
    return src(path.src.css)
        .pipe(concat("style.css"))
        // Error checking
        .pipe(
            plumber({
                errorHandler: notify.onError({
                    title: "Styles",
                    message: "Error: <%= error.message %>"
                })
            })
        )
        .pipe(
            scss({
                outputStyle: "expanded"
            })
        )
        .pipe(
            group_media()
        )
        .pipe(
            autoprefixer({
              overrideBrowserslist: ["last 15 versions", "> 1%", "ie 8", "ie 7"],
              cascade: true
            })
        )
        // .pipe(webpcss({webpClass: '.webp',noWebpClass: '.no-webp'}))
        .pipe(dest(path.build.css))
        .pipe(sourcemaps.init())
        .pipe(
            clean_css({ level: { 1: { specialComments: 0 } } }, details => {
                console.log(`${details.name}: ${details.stats.originalSize}`);
                console.log(`${details.name}: ${details.stats.minifiedSize}`);
            })
        )
        .pipe(rev())
        .pipe(revdel_origin())
        .pipe(
            rename({
                basename: "style",
                extname: ".min.css"
            })
        )
        .pipe(sourcemaps.write(""))
        .pipe(dest(path.build.css))
        .pipe(rev.manifest())
        .pipe(revDel({dest: path.build.css}))
        .pipe(dest(path.build.css))
        .pipe(browsersync.stream())

}

function js() {
    return src(path.src.js)
        //Collecting html js
        .pipe(concat("main.js"))
        
        // Error checking
        .pipe(
            plumber({
            errorHandler: notify.onError({
                title: "Styles",
                message: "Error: <%= error.message %>"
            })
            })
        )
        .pipe(babel({
            presets: ['@babel/env']
        }))
        //js output folder
        .pipe(dest(path.build.js))
        .pipe(sourcemaps.init())
        .pipe(
            uglify()
        )
        .pipe(rev())
        .pipe(revdel_origin())
        .pipe(
            rename({
                basename: "main",
                extname: ".min.js"
            })
        )
        //Creating a sourcemap
        .pipe(sourcemaps.write("."))
        .pipe(dest(path.build.js))
        .pipe(rev.manifest())
        .pipe(revDel({dest: path.build.js}))
        .pipe(dest(path.build.js))
        .pipe(browsersync.stream())
}

function images() {
    return src(path.src.img)
        // .pipe(
        //     webp({
        //         quality: 70
        //     })
        // )
        // .pipe(dest(path.build.img))
        // .pipe(src(path.src.img))
        // .pipe(
        //     cache(
        //         imagemin([
        //             imagemin.gifsicle({ interlaced: true }),
        //             jpegrecompress({
        //               progressive: true,
        //               max: 90,
        //               min: 80
        //             }),
        //             pngquant(),
        //             imagemin.svgo({ plugins: [{ removeViewBox: false }] })
        //         ])
        //     )
        // )
         //output folder for img
         .pipe(dest(path.build.img))
         .pipe(browsersync.stream())
}

function fonts() {
    src(path.src.fonts)
        .pipe(ttf2woff())
        .pipe(dest(path.build.fonts));
    return src(path.src.fonts)
        .pipe(ttf2woff2())
        .pipe(dest(path.build.fonts));
}

gulp.task('otf2ttf', function() {
    return src([source_folder + '/fonts/*.otf'])
        .pipe(fonter({
            format:['ttf']
        }))
        .pipe(dest(source_folder + '/fonts/'))
})

// clearing the cache
gulp.task("cache:clear", () => {
    cache.clearAll();
});

function watchFiles(params) {
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.css], css);
    gulp.watch([path.watch.js], js);
    gulp.watch([path.watch.img], images);
}

function clean(params) {
    return del(path.clean);
}

let build = gulp.series(clean, gulp.parallel(js, css, html, images, fonts));
let watch = gulp.parallel(build, watchFiles, browserSync);

exports.fonts = fonts;
exports.images = images;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;