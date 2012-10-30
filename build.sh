rm -rf target
mkdir target

cp src/main/bulletml.js         target/bulletml-$1.js
cp src/main/bulletml.enchant.js target/bulletml.enchant-$1.js

java -jar build-tools/compiler-latest/compiler.jar --js=src/main/bulletml.js --js_output_file=target/bulletml-min.js
java -jar build-tools/compiler-latest/compiler.jar --js=src/main/bulletml.js --js=src/main/bulletml.enchant.js --js_output_file=target/bulletml-join-$1.min.js

java -jar build-tools/jsdoc-toolkit/jsrun.jar build-tools/jsdoc-toolkit/app/run.js -t=build-tools/jsdoc-toolkit/templates/jsdoc -d=doc src/main/bulletml.enchant.js
