var PATTERNS = {};
tm.preload(function() {
    tm.graphics.TextureManager.add("redBullet", "images/bullet_red.png");
    tm.graphics.TextureManager.add("blueBullet", "images/bullet_blue.png");

    var createPattern = function(bml) {
        return tm.bulletml.AttackPattern(new bulletml.Root(bml));
    };

    var $ = bulletml.dsl;
    PATTERNS["p1"] = createPattern({
        top: $.action([
            $.repeat(999, [

                // left
                $.fire($.direction(0, "absolute"), $.bulletRef("accelNeedle"), $.offsetX(-30)),
                $.repeat(360/13, [
                    $.fire($.direction(13, "sequence"), $.bulletRef("accelNeedle"), $.offsetX(-30)),
                ]),

                // right
                $.fire($.direction(0, "absolute"), $.bulletRef("accelNeedle"), $.offsetX( 30)),
                $.repeat(360/13, [
                    $.fire($.direction(13, "sequence"), $.bulletRef("accelNeedle"), $.offsetX( 30)),
                ]),

                // 5way
                $.fire($.direction(-10), $.bulletRef("normalBullet"), $.offsetY(-10)),
                $.repeat(4, [
                    $.fire($.direction(5, "sequence"), $.bulletRef("normalBullet"), $.offsetY(-10)),
                ]),

                $.wait(30),
            ]),
        ]),
        normalBullet: $.bullet({
            image: "redBullet",
            scaleX: 1.0,
            scaleY: 1.0,
        }),
        accelNeedle: $.bullet([
            $.wait(10),
            $.changeSpeed($.speed(2), 60),
        ], {
            image: "blueBullet",
            scaleX: 0.5,
            scaleY: 2.0,
        }),
    });
});

tm.main(function() {
    var app = tm.app.CanvasApp("#world");
    app.fps = 60;
    app.resize(320, 320).fitWindow();

    var player = Player(app.width/2, app.height-30).addChildTo(app.currentScene);
    var enemy = Enemy(app.width/2, app.height/2).addChildTo(app.currentScene);

    setupPatternConfig(app, player);

    enemy.addEventListener("enterframe", function() {
        this.x = app.width/2 + Math.cos(app.frame/120) * 100;
        this.y = 80 + Math.sin(app.frame/120) * 30;
    });
    enemy.addEventListener("enterframe", PATTERNS["p1"].createTicker());

    app.run();
});

var setupPatternConfig = function(app, player) {
    var conf = tm.bulletml.AttackPattern.defaultConfig;
    conf.target = player;
    conf.bulletFactory = function(spec) {
        var b = tm.app.Sprite(16, 16, tm.graphics.TextureManager.get(spec.image));
        b.setFrameIndex(0, 64, 64);
        b.scaleX = spec.scaleX;
        b.scaleY = spec.scaleY;
        return b;
    };
    conf.isInsideOfWorld = function(b) {
        return 0 < b.x && b.x < app.width && 0 < b.y && b.y < app.height;
    };
    conf.updateProperties = true;
};

var Player = tm.createClass({
    superClass: tm.app.TriangleShape,
    init: function(x, y) {
        this.superInit(16, 16);
        this.setPosition(x, y);
    },
    update: function(app) {
        if (app.pointing.getPointing()) {
            this.x += app.pointing.deltaPosition.x;
            this.y += app.pointing.deltaPosition.y;
        }
    }
});
var Enemy = tm.createClass({
    superClass: tm.app.CircleShape,
    init: function(x, y) {
        this.superInit(16, 16, {
            fillStyle: "red"
        });
        this.setPosition(x, y);
    }
});
