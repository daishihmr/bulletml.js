var PATTERNS = {};
tm.preload(function() {
    tm.graphics.TextureManager.add("redBullet", "images/bullet3_red.png");
    tm.graphics.TextureManager.add("blueBullet", "images/bullet_blue.png");

    var createPattern = function(bml) {
        return tm.bulletml.AttackPattern(new bulletml.Root(bml));
    };

    var $ = bulletml.dsl;

    var normalBullet = $.bullet({
        image: "redBullet",
        scaleX: 1.2,
        scaleY: 0.8,
        updateProperties: false,
        rotate: true,
    });
    var accelNeedle = $.bullet([
        $.wait(10),
        $.changeSpeed($.speed(2), 60),
    ], {
        image: "blueBullet",
        scaleX: 0.5,
        scaleY: 2.0,
        updateProperties: true,
    });

    PATTERNS["p1"] = createPattern({

        top: $.action([
            $.repeat(999, [

                // left
                $.fire($.bulletRef("accelNeedle"), $.offsetX(-30)),
                $.repeat(20-1, [
                    $.fire($.direction(360/20, "sequence"), $.bulletRef("accelNeedle"), $.offsetX(-30)),
                ]),

                // right
                $.fire($.bulletRef("accelNeedle"), $.offsetX( 30)),
                $.repeat(20-1, [
                    $.fire($.direction(360/20, "sequence"), $.bulletRef("accelNeedle"), $.offsetX( 30)),
                ]),

                // 4way or 3way
                $.fire($.direction(-30), $.bulletRef("normalBullet"), $.offsetY(-10)),
                $.bindVar("i", "(($loop.index%2) ? 4 : 3) - 1"),
                $.repeat("$i", [
                    $.fire($.direction("60 / $i", "sequence"), $.bulletRef("normalBullet"), $.offsetY(-10)),
                ]),

                $.wait(200),
            ]),
        ]),

        normalBullet: normalBullet,
        accelNeedle: accelNeedle,

    });

    PATTERNS["p2"] = createPattern({

        top: $.action([
            $.repeat(999, [

                $.wait(100),

                $.notify("発射1秒前"), // アタッカーにイベント通知

                $.wait(60),

                $.fire($.bulletRef("normalBullet")),
                $.fire($.direction(0, "sequence"), $.speed(1.2), $.bulletRef("normalBullet")),
                $.fire($.direction(0, "sequence"), $.speed(1.4), $.bulletRef("normalBullet")),

            ]),
        ]),

        normalBullet: normalBullet,
        accelNeedle: accelNeedle,

    });
});

tm.main(function() {
    var app = tm.app.CanvasApp("#world");
    app.fps = 60;
    app.background = "rgba(0, 0, 0, 0.3)";
    app.resize(320, 320).fitWindow();

    var player = Player(160, app.height-30).addChildTo(app.currentScene);

    setupPatternConfig(app, player);

    // 敵1. グルグル回りながら攻撃
    var enemy1 = Enemy(0, 0).addChildTo(app.currentScene);
    enemy1.addEventListener("enterframe", function() {
        this.x = app.width/2 + Math.cos(app.frame/120) * 100;
        this.y = 80 + Math.sin(app.frame/120) * 30;
    });
    enemy1.addEventListener("enterframe", PATTERNS["p1"].createTicker());

    // 敵2. 攻撃直前に伸びたり縮んだりする
    var enemy2 = Enemy(160, 50).addChildTo(app.currentScene);
    enemy2.addEventListener("enterframe", PATTERNS["p2"].createTicker());
    // BulletML側から通知されたイベントをハンドル
    enemy2.addEventListener("発射1秒前", function() {
        var before = this.scaleX;
        this.animation.addTween({
            prop: "scaleX",
            begin: before,
            finish: 3,
            duration: 500,
            func: tm.anim.easing.easeOutQuad,
        });
        this.animation.addTween({
            prop: "scaleX",
            begin: 3,
            finish: before,
            duration: 500,
            func: tm.anim.easing.easeInQuad,
            delay: 500,
        });
    });

    app.run();
});

var setupPatternConfig = function(app, player) {
    var conf = tm.bulletml.AttackPattern.defaultConfig;
    conf.target = player;
    conf.bulletFactory = function(spec) {
        var b = tm.app.Sprite(16, 16, tm.graphics.TextureManager.get(spec.image));
        b.setFrameIndex(0, 64, 64);
        b.scaleX = spec.scaleX || 1;
        b.scaleY = spec.scaleY || 1;
        b.updateProperties = !!spec.updateProperties;
        if (spec.rotate) {
            b.addEventListener("enterframe", function() {
                this.rotation += 20;
            });
        }
        return b;
    };
    conf.isInsideOfWorld = function(b) {
        return 0 < b.x && b.x < app.width && 0 < b.y && b.y < app.height;
    };
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
    superClass: tm.app.RectangleShape,
    init: function(x, y) {
        this.superInit(32, 32, {
            fillStyle: "red"
        });
        this.setPosition(x, y);
        this.scale.x = 1.2;
        this.scale.y = 1;
    }
});
