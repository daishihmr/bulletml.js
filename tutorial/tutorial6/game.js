enchant();
window.onload = function() {
    var game = new Game();
    game.preload("chara1.png", "icon0.png", "labeled.xml");
    game.onload = function() {
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

        var enemy = new Sprite(32, 32);
        enemy.image = game.assets["chara1.png"];
        enemy.frame = 5;
        enemy.x = 144;
        enemy.y = 0;
        game.rootScene.addChild(enemy);

        var pattern = new AttackPattern(game.assets["labeled.xml"]);
        var ticker = pattern.createTicker({
            target : player,
            updateProperties : true,
            bulletFactory : function(spec) {
                var bullet = new Sprite(16, 16);
                bullet.image = game.assets["icon0.png"];
                switch (spec.label) {
                case "spade":
                    bullet.frame = 67;
                    break;
                case "clover":
                    bullet.frame = 68;
                    break;
                case "diamond":
                    bullet.frame = 69;
                    break;
                case "heart":
                    bullet.frame = 70;
                    break;
                }
                bullet.addEventListener("enterframe", function() {
                    this.rotation = this.direction;
                    if (this.within(player, 10)) {
                        game.stop();
                    }
                });
                return bullet;
            }
        });

        enemy.on("enterframe", ticker);
    };
    game.start();
};
