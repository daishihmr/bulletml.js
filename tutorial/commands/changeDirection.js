enchant.ENV.PREVENT_DEFAULT_KEY_CODES = [];
enchant();

window.onload = function() {
    var button = document.getElementById("start-button");
    var menu = document.getElementById("menu");
    var text = document.getElementById("text");
    for (var i = 0; i < 30; i++) {
        var script = document.getElementById("bml" + i);
        if (script) {
            var option = document.createElement("option");
            option.value = "bml" + i;
            option.textContent = script.getAttribute("name");
            menu.appendChild(option);
        }
    }
    menu.onchange = function() {
        text.value = document.getElementById(this.value).textContent;
    };
    menu.onchange();

    var bullets = [];
    var game = new Game(320, 320);
    game.fps = 60;
    game.preload("chara1.png");
    game.onload = function() {
        var player = setupPlayer(game);
        var enemy = setupEnemy(game);

        button.onclick = function() {
            enemy.moveTo(94, 32);
            bullets.forEach(function(b) {
                game.rootScene.removeChild(b);
            });
            bullets.splice(0);
            var bml = bulletml.build(text.value);
            enemy.onenterframe = new AttackPattern(bml).createTicker({
                target: player,
                bulletFactory: function() {
                    var b = enchant.bulletml.defaultBulletFactory();
                    bullets.push(b);
                    b.scale(2, 0.5);
                    return b;
                },
                isInsideOfWorld: function() { return true },
                updateProperties: true
            });
        };
    };
    game.start();
};

var setupPlayer = function(game) {
    var player = new Sprite(32, 32);
    player.image = game.assets["chara1.png"];
    player.moveTo(194, 256);
    game.rootScene.addChild(player);
    return player;
};
var setupEnemy = function(game) {
    var enemy = new Sprite(32, 32);
    enemy.image = game.assets["chara1.png"];
    enemy.frame = 6;
    enemy.moveTo(94, 32);
    game.rootScene.addChild(enemy);
    return enemy;
};
