rm -rf target
mkdir target

java -jar build-tools/compiler-latest/compiler.jar \
    --warning_level VERBOSE \
    --language_in ECMASCRIPT5 \
    --compilation_level SIMPLE_OPTIMIZATIONS \
    --js src/main/bulletml.js \
    --js src/main/bulletml.walker.js \
    --js src/main/bulletml.xml.js \
    --js src/main/bulletml.dsl.js \
    --js src/main/bulletml.runner.js \
    --js_output_file target/bulletml.min.js \
    # --formatting PRETTY_PRINT

# java -jar build-tools/jsdoc-toolkit/jsrun.jar \
#     build-tools/jsdoc-toolkit/app/run.js \
#     -d=doc\
#     -a \
#     -t=build-tools/jsdoc-toolkit/templates/jsdoc \
#     src/main/
