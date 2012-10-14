rm -rf target
mkdir target

java -jar ~/tool/compiler-latest/compiler.jar --js=main/bulletml.js --js=main/bulletml.enchant.js --js_output_file=target/bulletml-join-$1.min.js

cp main/bulletml.js         target/bulletml-$1.js
cp main/bulletml.enchant.js target/bulletml.enchant-$1.js

zip -j target/bulletml.js-$1.zip target/*
