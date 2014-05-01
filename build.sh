rm -rf build
mkdir build

java -jar build-tools/compiler-latest/compiler.jar \
    --warning_level VERBOSE \
    --language_in ECMASCRIPT5 \
    --compilation_level SIMPLE_OPTIMIZATIONS \
    --js src/main/bulletml.js \
    --js src/main/bulletml.walker.js \
    --js src/main/bulletml.xml.js \
    --js src/main/bulletml.dsl.js \
    --js src/main/bulletml.runner.js \
    --js_output_file build/bulletml.min.js \
    # --formatting PRETTY_PRINT
