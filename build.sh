rm -rf target
mkdir target

cp main/bulletml.js         tutorial/tutorial4/bulletml.js
cp main/bulletml.enchant.js tutorial/tutorial4/bulletml.enchant.js
cp main/bulletml.js         tutorial/tutorial5/bulletml.js
cp main/bulletml.enchant.js tutorial/tutorial5/bulletml.enchant.js
cp main/bulletml.js         tutorial/tutorial6/bulletml.js
cp main/bulletml.enchant.js tutorial/tutorial6/bulletml.enchant.js
cp main/bulletml.js         tutorial/tutorial7/bulletml.js
cp main/bulletml.enchant.js tutorial/tutorial7/bulletml.enchant.js
cp main/bulletml.js         tutorial/tutorial8/bulletml.js
cp main/bulletml.enchant.js tutorial/tutorial8/bulletml.enchant.js

cp main/bulletml.js         target/bulletml-$1.js
cp main/bulletml.enchant.js target/bulletml.enchant-$1.js

java -jar build-tools/compiler-latest/compiler.jar --js=main/bulletml.js --js=main/bulletml.enchant.js --js_output_file=target/bulletml-join-$1.min.js

java -jar build-tools/jsdoc-toolkit/jsrun.jar build-tools/jsdoc-toolkit/app/run.js -t=build-tools/jsdoc-toolkit/templates/jsdoc -d=doc main/bulletml.enchant.js
