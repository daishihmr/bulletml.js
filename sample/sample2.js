enchant();

window.onload = function() {
    var game = new Game();
    game.fps = 60;
    game.preload(
        "sample-assets/chara0.png",
        "sample-assets/chara6.png",
        "sample-assets/explosion.png"
    );
    game.onload = function() {
        var scene = game.rootScene;
        scene.backgroundColor = "#000033";

        // 自機
        var player = new Sprite(32, 32);
        player.image = game.assets["sample-assets/chara0.png"];
        player.frame = 33;
        player.frameCount = 0;
        player.x = 160;
        player.y = game.height - 32 - player.height;
        player.speed = 2;
        player.on("enterframe", function() {
            // テクテク歩く
            if (this.age % 10 === 0) {
                this.frame = [ 33, 34, 35, 34 ][(this.frameCount += 1) % 4];
            }

            // 自機中心マーカーを移動させる
            playerCenter.x = this.x + (this.width - playerCenter.width) / 2;
            playerCenter.y = this.y + (this.height - playerCenter.height) / 2;

            for ( var i = bulletPool.length; i--;) {
                var b = bulletPool[i];
                if (b.active && this.within(b, 4)) {
                    b.parentNode.removeChild(b);
                    explode(b);
                }
            }
        });
        scene.addChild(player);
        // 自機の中心マーカー
        var playerCenter = new Sprite(8, 8);
        (function() {
            playerCenter.image = new Surface(8, 8);
            var c = playerCenter.image.context;
            var g = c.createRadialGradient(4, 4, 0, 4, 4, 4);
            g.addColorStop(0.0, "#ffffff");
            g.addColorStop(0.5, "#aaffaa");
            g.addColorStop(1.0, "rgba(0,255,0,0)");
            c.fillStyle = g;
            c.fillRect(0, 0, 8, 8);
        })();
        scene.addChild(playerCenter);

        function bulletTexture() {
            var sur = new Surface(8*3, 8);
            var ctx = sur.context;
            var g;
            // red
            g = ctx.createRadialGradient(8*0 + 4, 4, 0, 8*0 + 4, 4, 4);
            g.addColorStop(0.0, "#ffffff");
            g.addColorStop(0.5, "#ffffff");
            g.addColorStop(0.9, "#ff0000");
            g.addColorStop(1.0, "rgba(255,255,255,0)");
            ctx.fillStyle = g;
            ctx.fillRect(8*0, 0, 8, 8);
            // green
            g = ctx.createRadialGradient(8*1 + 4, 4, 0, 8*1 + 4, 4, 4);
            g.addColorStop(0.0, "#ffffff");
            g.addColorStop(0.5, "#ffffff");
            g.addColorStop(0.9, "#00ff00");
            g.addColorStop(1.0, "rgba(255,255,255,0)");
            ctx.fillStyle = g;
            ctx.fillRect(8*1, 0, 8, 8);
            // blue
            g = ctx.createRadialGradient(8*2 + 4, 4, 0, 8*2 + 4, 4, 4);
            g.addColorStop(0.0, "#ffffff");
            g.addColorStop(0.5, "#ffffff");
            g.addColorStop(0.9, "#0000ff");
            g.addColorStop(1.0, "rgba(255,255,255,0)");
            ctx.fillStyle = g;
            ctx.fillRect(8*2, 0, 8, 8);
            return sur;
        }

        // 弾プール
        var bulletPool = [];
        for ( var i = 0; i < 3000; i++) {
            var bullet = new Sprite(8, 8);
            bullet.image = bulletTexture();
            bullet.compositeOperation = "lighter";
            bullet.active = false;
            bullet.on("removed", function() {
                this.active = false;
                this.removeDanmaku();
            });
            bulletPool[i] = bullet;
        }
        bulletPool.get = function(spec) {
            for ( var i = this.length; i--;) {
                if (!this[i].active) {
                    this[i].active = true;
                    this[i].age = 0;
                    if (spec.label == "green") {
                        this[i].frame = 1;
                    } else if (spec.label == "blue") {
                        this[i].frame = 2;
                    } else {
                        this[i].frame = 0;
                    }
                    return this[i];
                }
            }
            console.log("弾切れ");
        };

        // 敵
        var enemy = new Sprite(32, 32);
        enemy.image = game.assets["sample-assets/chara6.png"];
        enemy.frame = 3;
        enemy.frameCount = 0;
        enemy.x = (game.width - enemy.width) / 2;
        enemy.y = 64;
        enemy.on("enterframe", function() {
            // テクテク歩く
            if (this.age % 10 === 0) {
                this.frame = [ 3, 4, 5, 4 ][(this.frameCount += 1) % 4];
            }
        });
        scene.addChild(enemy);

        // 攻撃パターンのデフォルト設定
        // 攻撃対象
        AttackPattern.defaultConfig.target = player;
        // 弾の生成関数
        AttackPattern.defaultConfig.bulletFactory = function(spec) {
            return bulletPool.get(spec);
        };
        // 弾速
        AttackPattern.defaultConfig.speedRate = 1.2;

        // 敵機に弾幕をセット
        enemy.setDanmaku(new AttackPattern(pattern0));

        // 攻撃完了時の処理
        enemy.on("completeAttack", function() {
            console.log("攻撃完了");
            this.tl.moveTo((game.width - this.width) / 2, 64, 60, enchant.Easing.QUAD_EASEINOUT)
                .then(function() {
                    this.setDanmaku(new AttackPattern(pattern1));
                });
        });

        // タッチ操作用パネル
        var ctrlPanel = new Sprite(game.width, game.height);
        ctrlPanel.on("touchstart", function(e) {
            this.startX = e.x;
            this.startY = e.y;
            this.startPlayerX = player.x;
            this.startPlayerY = player.y;
        });
        ctrlPanel.on("touchmove", function(e) {
            player.x = this.startPlayerX + (e.x - this.startX);
            player.y = this.startPlayerY + (e.y - this.startY);

            if (player.x < 0) {
                player.x = this.startPlayerX = 0;
                this.startX = e.x;
            } else if (game.width - player.width < player.x) {
                player.x = this.startPlayerX = game.width - player.width;
                this.startX = e.x;
            }
            if (player.y < 0) {
                player.y = this.startPlayerY = 0;
                this.startY = e.y;
            } else if (game.height - player.height < player.y) {
                player.y = this.startPlayerY = game.height - player.height;
                this.startY = e.y;
            }
        });
        game.rootScene.addChild(ctrlPanel);

        // 爆発
        var explode = function(obj) {
            var e = new Sprite(32, 32);
            e.compositeOperation = "lighter";
            e.x = obj.x + obj.width / 2 - 16;
            e.y = obj.y + obj.height / 2 - 16;
            e.scale(2);
            e.rotate(Math.random() * 360);
            e.image = game.assets["sample-assets/explosion.png"];
            e.on("enterframe", function() {
                this.frame += 1;
                if (64 <= this.frame) {
                    this.removeEventListener("enterframe", arguments.callee);
                    this.parentNode.removeChild(this);
                }
            });
            scene.addChild(e);
        };

    };
    game.start();
};

BulletML.dsl();
var pattern0 = new BulletML.Root({
    top : action(
        fire(bulletRef("parentbit", 1), direction(30, "aim")),
        fire(bulletRef("parentbit", -1), direction(-30, "aim")),
        wait(300)
    ),
    parentbit : bullet(
        speed(2.0),
        action(
            actionRef("cross", 75, 0),
            actionRef("cross", 70, 0),
            actionRef("cross", 65, 0),
            actionRef("cross", 60, 0),
            actionRef("cross", 55, 0),
            actionRef("cross", 50, 0),
            actionRef("cross", 80, "15 * $1"),
            actionRef("cross", 75, "10 * $1"),
            actionRef("cross", 70, "6 * $1"),
            actionRef("cross", 65, "3 * $1"),
            actionRef("cross", 60, "1 * $1"),
            actionRef("cross", 55, 0),
            vanish()
        )
    ),
    cross : action(
        fire(bulletRef("aimbit", "$1", "$2"), direction(0, "absolute")),
        fire(bulletRef("aimbit", "$1", "$2"), direction(90, "absolute")),
        fire(bulletRef("aimbit", "$1", "$2"), direction(180, "absolute")),
        fire(bulletRef("aimbit", "$1", "$2"), direction(270, "absolute")),
        wait(5)
    ),
    aimbit : bullet(
        speed(0.6),
        action(
            wait("$1"),
            fire(
                bullet(),
                direction("$2", "aim"),
                speed("1.6 * (0.5 + 0.5 * $rank)")
            ),
            repeat("2 + 5 * $rank", [
                fire(bullet(), direction(0, "sequence"), speed(0.1, "sequence"))
            ])
        )
    )
});
var pattern1 = new BulletML.Root({
    top : action(function() {
        var commands = [];
        commands[0] = changeSpeed(speed(0.2), 1);
        commands[1] = changeDirection(direction(90, "absolute"), 1);
        for (var i = 180; i < 210; i++) {
            commands.push(fire(bullet(direction(5 + i*15, "absolute"), "red")));
            commands.push(fire(bullet(direction(0 + i*15, "absolute"), "green")));
            commands.push(fire(bullet(direction(-5 + i*15, "absolute"), "blue")));
            commands.push(wait(15));
        }
        return commands;
    })
});
