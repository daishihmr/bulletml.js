Array.prototype.pool = function(o) {
    o.active = false;
    this.push(o);
};
Array.prototype.get = function() {
    for ( var i = 0, end = this.length; i < end; i++) {
        var o = this[i];
        if (!o.active) {
            o.active = true;
            return o;
        }
    }
};

var file = "[Dodonpachi]_hibachi.xml";
enchant();
window.onload = function() {
    var game = new Game();
    game.fps = 120;
    game.preload("sample-assets/" + file);
    game.on("load", function() {
        var img = new Surface(8, 8);
        img.context.fillStyle = "rgba(0,0,255,0.02)";
        img.context.fillRect(6, 6, 2, 2);

        var pool = [];
        for ( var i = 0; i < 2000; i++) {
            var b = new Sprite(8, 8);
            b.image = img;
            b.on("removed", function() {
                this.active = false;
            });
            pool.pool(b);
        }

        AttackPattern.defaultConfig.target = new Sprite(32, 32);
        AttackPattern.defaultConfig.bulletFactory = function() {
            return pool.get();
        };

        var s = new Sprite(32, 32);
        s.x = s.y = 144;
        s.setDanmaku(game.assets["sample-assets/" + file]);
        game.rootScene.addChild(s);

        var start = new Date().getTime();
        s.on("completeAttack", function() {
            console.log("complete " + (new Date().getTime() - start));
        });
    });
    game.start();
};
