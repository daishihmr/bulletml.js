rm -rf target
mkdir target

java -jar build-tools/compiler-latest/compiler.jar \
    --warning_level VERBOSE \
    --language_in ECMASCRIPT5 \
    --compilation_level SIMPLE_OPTIMIZATIONS \
    --js src/main/bulletml.js \
    --js src/main/bulletml.xml.js \
    --js src/main/bulletml.dsl.js \
    --js_output_file target/bulletml.min.js

java -jar build-tools/compiler-latest/compiler.jar \
    --warning_level QUIET \
    --language_in ECMASCRIPT5 \
    --compilation_level SIMPLE_OPTIMIZATIONS \
    --externs lib/enchant.js \
    --js src/main/bulletml.js \
    --js src/main/bulletml.xml.js \
    --js src/main/bulletml.dsl.js \
    --js src/main/bulletml.enchant.js \
    --js_output_file target/bulletml.for.enchant.js

java -jar build-tools/compiler-latest/compiler.jar \
    --warning_level QUIET \
    --language_in ECMASCRIPT5 \
    --compilation_level SIMPLE_OPTIMIZATIONS \
    --js src/main/bulletml.js \
    --js src/main/bulletml.xml.js \
    --js src/main/bulletml.dsl.js \
    --js src/main/bulletml.tmlib.js \
    --js_output_file target/bulletml.for.tmlib.js
