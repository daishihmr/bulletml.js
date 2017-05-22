bulletml.js
===========

[![Join the chat at https://gitter.im/daishihmr/bulletml.js](https://badges.gitter.im/daishihmr/bulletml.js.svg)](https://gitter.im/daishihmr/bulletml.js?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

JavaScript BulletML library.

Download
========

https://github.com/daishihmr/bulletml.js/releases/

CDN site
========

bulletml.min.js
---------------

https://cdn.rawgit.com/daishihmr/bulletml.js/master/build/bulletml.min.js

bulletml.enchant.js
-------------------

https://cdn.rawgit.com/daishihmr/bulletml.js/master/build/plugins/bulletml.enchant.js

tmlib.bulletml.js
-----------------

https://cdn.rawgit.com/daishihmr/bulletml.js/master/build/plugins/tmlib.bulletml.js


DEMO
====

[enchant.js使用](http://daishihmr.github.io/bulletml.js/sample/enchantjs.html)

[tmlib.js使用](http://daishihmr.github.io/bulletml.js/sample/tmlibjs.html)

[独自実装](http://daishihmr.github.io/bulletml.js/sample/originalGameEngine.html)


This library is used by ...
============================

<a href="http://tmshooter.net/"><img width="140" src="https://raw.githubusercontent.com/daishihmr/glshooter2/master/glshooter2.png"/></a>
<a href="http://9leap.net/games/2877/"><img src="http://9leap.net/screenshots//140x140/2877_140"/></a>
<a href="http://9leap.net/games/2995/"><img src="http://9leap.net/screenshots//140x140/2995_140"/></a>



FEATURES
========

Runner
------

~~~~
// setup
var bml = bulletml.buildXML("<bulletml>...</bulletml>");
var runner = bml.createRunner({
  target: playerShip, // enemy's attack target (has 'x' and 'y' property)
  createNewBullet: function(bulletRunner) { // function to be called when new bullet has been fired
    var bullet = new Bullet();
    bullet.update = function() {
      bulletRunner.update();
    };
    scene.addChild(bullet);
  }
});
runner.x = enemy.x;
runner.y = enemy.y;

enemy.update = function() {
  // every frame
  runner.x = this.x;
  runner.y = this.y;
  runner.update();
};
~~~~

DSL
---

~~~~
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

~~~~
var spec = new bulletml.Root({
    top: action([
        repeat(10, [
            fire(direction(60, "absolute"), bullet),
            wait(5),
        ]),
    ]),
});
~~~~
