enchant();
window.onload = function() {
    var game = new Game();
    game.preload("chara1.png", "icon0.png", "rolling.xml");
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
            var bullet = new Sprite(16, 16);
            bullet.image = game.assets["icon0.png"];
            bullet.frame = 46;
            bullet.addEventListener("enterframe", function() {
                if (this.within(player, 10)) {
                    game.stop();
                }
            });
            bullet.addEventListener("removed", function() {
                this.active = false;
            });
            bullet.active = false;
            bulletPool[i] = bullet;
        }

        // 攻撃パターンオブジェクト
        var pattern = new AttackPattern(game.assets["rolling.xml"]);
        // enterframeイベントリスナを生成
        var ticker = pattern.createTicker({
            target : player,
            bulletFactory : function(spec) {
                return bulletPool.get();
            }
        });
        // 生成したイベントリスナを敵機に登録
        enemy.addEventListener("enterframe", ticker);
    };
    game.start();
};
