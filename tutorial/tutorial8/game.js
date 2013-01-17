enchant();
window.onload = function() {
    var game = new Game();
    game.preload("chara1.png", "icon0.png");
    game.onload = function() {
        // （自機）茶くま
        var player = new Sprite(32, 32);
        player.image = game.assets["chara1.png"];
        player.frame = 0;
        player.x = 144;
        player.y = 288;
        game.rootScene.addChild(player);
        player.addEventListener("enterframe", function() {
            if (game.input.up) {
                this.y -= 5;
            } else if (game.input.down) {
                this.y += 5;
            }
            if (game.input.left) {
                this.x -= 5;
            } else if (game.input.right) {
                this.x += 5;
            }
        });

        // （敵機）白くま
        var enemy = new Sprite(32, 32);
        enemy.image = game.assets["chara1.png"];
        enemy.frame = 5;
        enemy.x = 144;
        enemy.y = 20;
        game.rootScene.addChild(enemy);

        // 弾プール
        var bulletPool = [];
        bulletPool.get = function() {
            for ( var i = 0, end = this.length; i < end; i++) {
                if (!this[i].active) {
                    this[i].active = true;
                    return this[i];
                }
            }
        };
        for ( var i = 0; i < 30; i++) {
            var b = new Sprite(16, 16);
            b.image = game.assets["icon0.png"];
            b.frame = 46;
            b.addEventListener("enterframe", function() {
                if (this.within(player, 10)) {
                    game.stop();
                }
            });
            b.addEventListener("removed", function() {
                this.active = false;
            });
            b.active = false;
            bulletPool[i] = b;
        }

        // 攻撃パターンオブジェクト
        bulletml.dsl();
        var pattern = new AttackPattern(new bulletml.Root({
            top: action(
                fire(direction(-7), bullet()),
                wait(1),
                repeat(9999, action(
                    fire(direction(15, "sequence"), bullet()),
                    wait(1)
                ))
            )
        }));
        // enterframeイベントリスナを生成
        var ticker = pattern.createTicker({
            target: player,
            bulletFactory: function(spec) {
                return bulletPool.get();
            }
        });
        // 生成したイベントリスナを敵機に登録
        enemy.addEventListener("enterframe", ticker);
    };
    game.start();
};
