@echo off

rmdir /S /Q target
mkdir target
rmdir /S /Q doc
mkdir doc

if not "%1" == "clean" (
copy src\main\bulletml.js         target\bulletml-%1.js
copy src\main\bulletml.enchant.js target\bulletml.enchant-%1.js
copy src\main\bulletml.tmlib.js   target\bulletml.tmlib-%1.js

java -jar build-tools\compiler-latest\compiler.jar --js=src\main\bulletml.js         --js_output_file=target\bulletml-%1.min.js
java -jar build-tools\compiler-latest\compiler.jar --js=src\main\bulletml.enchant.js --js_output_file=target\bulletml.enchant-%1.min.js
java -jar build-tools\compiler-latest\compiler.jar --js=src\main\bulletml.tmlib.js   --js_output_file=target\bulletml.tmlib-%1.min.js

java -jar build-tools\jsdoc-toolkit\jsrun.jar build-tools\jsdoc-toolkit\app\run.js -t=build-tools\jsdoc-toolkit\templates\bootstrap -d=doc src\main\bulletml.js src\main\bulletml.enchant.js src\main\bulletml.tmlib.js
)
