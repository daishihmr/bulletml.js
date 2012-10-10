enchant();
window.onload = function() {
    var game = new Game();
    game.preload("chara1.png", "icon0.png",
            "[ESP_RADE]_round_5_boss_gara_2.xml",
            "[Daiouzyou]_round_1_boss.xml",
            "[Daiouzyou]_round_1_boss_hakkyou.xml");
    game.onload = function() {
        var player = new Sprite(32, 32);
        player.image = game.assets["chara1.png"];
        player.frame = 0;
        player.x = 144;
        player.y = 288;
        game.rootScene.addChild(player);

        var enemy = new Sprite(32, 32);
        enemy.image = game.assets["chara1.png"];
        enemy.frame = 5;
        enemy.x = 144;
        enemy.y = 0;
        game.rootScene.addChild(enemy);

        var pattern = new AttackPattern(
                game.assets["[Daiouzyou]_round_1_boss_hakkyou.xml"]);
        var ticker = pattern.createTicker({
            target : player
        });
        enemy.on("enterframe", ticker);
    };
    game.start();
};
