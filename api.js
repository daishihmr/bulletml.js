var player = new Sprite(32, 32);
var enemy = new Sprite(32, 32);

var bulletFactory = function(spec) {
    var bullet = new Sprite(8, 8);
    bullet.image = game.assets["bullet.png"];
    switch (spec.label) {
    case "red":
        bullet.frame = 0;
        break;
    case "bule":
        bullet.frame = 1;
        break;
    case "green":
        bullet.frame = 2;
        break;
    }
    return bullet;
};

var attackPattern = new AttackPattern(xml, {
    target : player,
    bulletFactory : bulletFactory
});

var ticker = attackPattern.createTicker("top", 0.5);
enemy.on("enterframe", ticker);
