var SOURCES = [
    "src/main/bulletml.js",
    "src/main/bulletml.walker.js",
    "src/main/bulletml.xml.js",
    "src/main/bulletml.dsl.js",
    "src/main/bulletml.json.js",
    "src/main/bulletml.runner.js",
    "src/main/bulletml.output.json.js",
];

var BANNER = "/*\n\
 * bulletml.js v<%= pkg.version %>\n\
 * https://github.com/daishihmr/bulletml.js\n\
 * \n\
 * The MIT License (MIT)\n\
 * Copyright © 2014 daishi_hmr, dev7.jp\n\
 * \n\
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and\n\
 * associated documentation files (the “Software”), to deal in the Software without restriction, including\n\
 * without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies\n\
 * of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following\n\
 * conditions:\n\
 * \n\
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions\n\
 * of the Software.\n\
 * \n\
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\n\
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\n\
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\n\
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\n\
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\n\
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN\n\
 * THE SOFTWARE.\n\
 */\n\
 \n";

module.exports = function(grunt) {

    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        copy: {
            main: {
                expand: true,
                cwd: "src",
                src: "plugins/*",
                dest: "build/"
            }
        },
        concat: {
            main: {
                options: {
                    banner: BANNER
                },
                src: SOURCES,
                dest: "build/bulletml.js"
            },
            node: {
                options: {
                    banner: BANNER,
                    footer: "\nmodule.exports = bulletml;\n"
                },
                src: SOURCES,
                dest: "build/bulletml.node.js"
            }
        },
        uglify: {
            main: {
                options: {
                    banner: BANNER,
                    sourceMap: true
                },
                files: {
                    "build/bulletml.min.js": SOURCES
                }
            }
        },
        watch: {
            scripts: {
                files: ["src/**/*.js"],
                tasks: ["copy", "uglify"]
            }
        }
    });

    grunt.registerTask("default", ["copy", "concat", "uglify"]);

};
