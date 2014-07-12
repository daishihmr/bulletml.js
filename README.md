bulletml.js
===========

弾幕記述言語BulletMLをJavaScriptで利用するためのユーティリティ集。

enchant.js用プラグイン、tmlib.js用プラグインもあるよ。

bulletml.js
-----------

BulletMLをJavaScriptで読み込んでいろいろやるためのライブラリ。



bulletml.enchant.js
-------------------

enchant.jsでBulletMLを利用するためのプラグイン。

使い方は[wiki](https://github.com/daishihmr/bulletml.js/wiki)を参照。



tmlib.bulletml.js
-----------------

tmlib.jsでBulletMLを利用するためのプラグイン。



DEMO
====

<a href="http://jsdo.it/daishi.hmr/oLN6"><img width="140" src="http://jsdo-it-static-contents.s3.amazonaws.com/images/capture/o/L/N/oLN6.jpg"/></a>
<a href="http://jsdo.it/daishi.hmr/xPND"><img width="140" src="http://jsdo-it-static-contents.s3.amazonaws.com/images/capture/x/P/N/xPND.jpg"/></a>
<a href="http://jsdo.it/daishi.hmr/vZxS"><img width="140" src="http://jsdo-it-static-contents.s3.amazonaws.com/images/capture/v/Z/x/vZxS.jpg"/></a>



This library is used by ...
============================

<a href="http://tmshooter.net/"><img width="140" src="http://tmshooter.net/tmshooter/glshooter2.png"/></a>
<a href="http://9leap.net/games/2877/"><img src="http://9leap.net/screenshots//140x140/2877_140"/></a>
<a href="http://9leap.net/games/2995/"><img src="http://9leap.net/screenshots//140x140/2995_140"/></a>



FEATURES
========

Parser
------

従来型の、XMLで記述されたBulletMLをロードして実行することができます

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

JavaScriptによるDSLで弾幕定義を記述することができます

XMLで書くとこんな弾幕も…
~~~~xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE bulletml SYSTEM "http://www.asahi-net.or.jp/~cs8k-cyu/bulletml/bulletml.dtd">
<bulletml xmlns="http://www.asahi-net.or.jp/~cs8k-cyu/bulletml">
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

DSLで書くとこんなにスッキリ！
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
