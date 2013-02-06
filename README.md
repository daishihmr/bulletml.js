bulletml.js
===========

BulletMLをJavaScriptで読み込んでいろいろやるためのパーサー。



bulletml.enchant.js
===================

enchant.jsでBulletMLを利用するためのプラグイン。

使い方は[wiki](https://github.com/daishihmr/bulletml.js/wiki)を参照。



bulletml.tmlib.js
===================

tmlib.jsでBulletMLを利用するためのプラグイン。



DEMO
====

<a href="http://9leap.net/games/2877/"><img src="http://9leap.net/screenshots//140x140/2877_140"/></a>
<a href="http://9leap.net/games/2364/"><img src="http://9leap.net/screenshots//140x140/2364_140"/></a>



FEATURES
========

Parser
------

従来型の、XMLで記述されたBulletMLをロードして実行できる

~~~~javascript
// enchant.js
var game = new Game();
game.preload("bulletml.xml");
game.onload = function() {
    var attackPattern = game.assets["bulletml.xml");
};
game.start();
~~~~

DSL
---

JavaScriptによるDSLでBulletMLを記述できる

XML
~~~~xml
<?xml version="1.0" encoding="UTF-8"?>
<bulletml>
    <action label="top">
        <repeat>
            <times>10</times>
            <action>
                <fire>
                    <direction type="absolute">60</direction>
                    <bullet />
                </fire>
                <wait>5</wait>
            </action>
        </repeat>
    </action>
</bulletml>
~~~~

JavaScript DSL
~~~~javascript
var spec = new bulletml.Root({
    top: action([
        repeat(10, [
            fire(direction(60, "absolute"), bullet),
            wait(5),
        ]),
    ]),
});
~~~~
