"use strict";

var ParseTest2 = TestCase("ParseTest2");

ParseTest2.prototype.testBuild = function() {
    BulletML.dsl();
    var sample = new BulletML.Root({
        top : action([
            fire(bulletRef("parentbit", 1), direction(30, "aim")),
            fire(bulletRef("parentbit", -1), direction(-30, "aim")),
            wait(300)
        ]),
        parentbit : bullet(
            speed(2.0),
            action([
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
            ])
        ),
        cross : action([
            fire(bulletRef("aimbit", "$1", "$2"), direction(0, "absolute")),
            fire(bulletRef("aimbit", "$1", "$2"), direction(90, "absolute")),
            fire(bulletRef("aimbit", "$1", "$2"), direction(180, "absolute")),
            fire(bulletRef("aimbit", "$1", "$2"), direction(270, "absolute")),
            wait(5)
        ]),
        aimbit : bullet(
            null,
            speed(0.6),
            action([
                wait("$1"),
                fire(
                    bullet(),
                    direction("$2", "aim"),
                    speed("1.6 * (0.5 + 0.5 * $rank)")
                ),
                repeat("2 + 5 * $rank", action([
                    fire(bullet(), direction(0, "sequence"), speed(0.1, "sequence"))
                ]))
            ])
        )
    });

    assertNotUndefined(sample);
    assertEquals(sample.actions.length, 2);
    assertEquals(sample.bullets.length, 2);
    assertEquals(sample.fires.length, 0);

    var walker = sample.getWalker("top");
    var n;
    while (n = walker.next()) {
        console.log(n);
    }
};

ParseTest2.prototype.testVanish = function() {
    var v = vanish();
    assertEquals(v.commandName, "vanish");
    assertTrue(v instanceof BulletML.Vanish);
};

ParseTest2.prototype.testWait = function() {
    var n = wait(30);
    assertEquals(n.commandName, "wait");
    assertTrue(n instanceof BulletML.Wait);
    assertEquals(n.value, 30);
};

ParseTest2.prototype.testDirection = function() {
    var n = direction(30);
    assertTrue(n instanceof BulletML.Direction);
    assertEquals(n.value, 30);
    assertEquals(n.type, "aim");
};

ParseTest2.prototype.testSpeed = function() {
    var n = speed(50, "absolute");
    assertTrue(n instanceof BulletML.Speed);
    assertEquals(n.value, 50);
    assertEquals(n.type, "absolute");
};

ParseTest2.prototype.testHorizontal = function() {
    var n = horizontal(50, "absolute");
    assertTrue(n instanceof BulletML.Horizontal);
    assertEquals(n.value, 50);
    assertEquals(n.type, "absolute");
};

ParseTest2.prototype.testVertical = function() {
    var n = vertical(50, "absolute");
    assertTrue(n instanceof BulletML.Vertical);
    assertEquals(n.value, 50);
    assertEquals(n.type, "absolute");
};

ParseTest2.prototype.testChangeDirection = function() {
    var n = changeDirection(direction(30), 5);
    assertTrue(n instanceof BulletML.ChangeDirection);
    assertEquals(n.direction.value, 30);
    assertEquals(n.direction.type, "aim");
    assertEquals(n.term, 5);
};

ParseTest2.prototype.testChangeSpeed = function() {
    var n = changeSpeed(speed(33, "sequence"), 15);
    assertTrue(n instanceof BulletML.ChangeSpeed);
    assertEquals(n.speed.value, 33);
    assertEquals(n.speed.type, "sequence");
    assertEquals(n.term, 15);
};

ParseTest2.prototype.testAccel = function() {
    var n = accel(horizontal(1), vertical(2), 3);
    assertTrue(n instanceof BulletML.Accel);
    assertEquals(n.horizontal.value, 1);
    assertEquals(n.vertical.value, 2);
    assertEquals(n.term, 3);
};

ParseTest2.prototype.testAccel2 = function() {
    var n = accel(horizontal(1), 3);
    assertTrue(n instanceof BulletML.Accel);
    assertEquals(n.horizontal.value, 1);
    assertEquals(n.vertical, null);
    assertEquals(n.term, 3);
};

ParseTest2.prototype.testBullet = function() {
    var n = bullet();
    assertTrue(n instanceof BulletML.Bullet);
    assertEquals(n.direction.value, 0);
    assertEquals(n.direction.type, "aim");
    assertEquals(n.speed.value, 1);
    assertEquals(n.speed.type, "absolute");
};

ParseTest2.prototype.testBullet2 = function() {
    var n = bullet(direction(5, "sequence"), speed(6, "absolute"));
    assertTrue(n instanceof BulletML.Bullet);
    assertEquals(n.direction.value, 5);
    assertEquals(n.direction.type, "sequence");
    assertEquals(n.speed.value, 6);
    assertEquals(n.speed.type, "absolute");
};

ParseTest2.prototype.testBullet3 = function() {
    var n = bullet(direction(5, "sequence"));
    assertTrue(n instanceof BulletML.Bullet);
    assertEquals(n.direction.value, 5);
    assertEquals(n.direction.type, "sequence");
    assertEquals(n.speed.value, 1);
    assertEquals(n.speed.type, "absolute");
};

ParseTest2.prototype.testBullet4 = function() {
    var n = bullet(speed(6, "relative"));
    assertTrue(n instanceof BulletML.Bullet);
    assertEquals(n.direction.value, 0);
    assertEquals(n.direction.type, "aim");
    assertEquals(n.speed.value, 6);
    assertEquals(n.speed.type, "relative");
};

ParseTest2.prototype.testBullet5 = function() {
    var n = bullet();
    assertTrue(n instanceof BulletML.Bullet);
    assertEquals(n.direction.value, 0);
    assertEquals(n.direction.type, "aim");
    assertEquals(n.speed.value, 1);
    assertEquals(n.speed.type, "absolute");
};

ParseTest2.prototype.testBullet6 = function() {
    var n = bullet(action([vanish()]));
    assertTrue(n instanceof BulletML.Bullet);
    assertEquals(n.direction.value, 0);
    assertEquals(n.direction.type, "aim");
    assertEquals(n.speed.value, 1);
    assertEquals(n.speed.type, "absolute");
    assertEquals(n.actions.length, 1);
    assertEquals(n.actions[0].commands[0].commandName, "vanish");
};

ParseTest2.prototype.testBullet7 = function() {
    var n = bullet(actionRef("a1"));
    assertTrue(n instanceof BulletML.Bullet);
    assertEquals(n.direction.value, 0);
    assertEquals(n.direction.type, "aim");
    assertEquals(n.speed.value, 1);
    assertEquals(n.speed.type, "absolute");
    assertEquals(n.actions.length, 1);
    assertEquals(n.actions[0].label, "a1");
};

ParseTest2.prototype.testAction = function() {
    var n = action([wait(10), vanish()]);
    assertEquals(n.commands.length, 2);
    assertEquals(n.commands[0].commandName, "wait");
    assertEquals(n.commands[1].commandName, "vanish");
};

ParseTest2.prototype.testAction2 = function() {
    var n = action([wait(10), vanish()]);
    assertEquals(n.commands.length, 2);
    assertEquals(n.commands[0].commandName, "wait");
    assertEquals(n.commands[1].commandName, "vanish");
};

ParseTest2.prototype.testActionArgType = function() {
    try {
        var n = action([wait(10), "aaa"]);
    } catch (e) {
        assertEquals(e.message, "argument type error.");
        return;
    }
    fail();
};

ParseTest2.prototype.testActionRef = function() {
    var n = actionRef("shot", 1, 2, 3, "4");
    assertTrue(n instanceof BulletML.ActionRef);
    assertEquals(n.label, "shot");
    assertEquals(n.params[0], 1);
    assertEquals(n.params[1], 2);
    assertEquals(n.params[2], 3);
    assertEquals(n.params[3], "4");
};

ParseTest2.prototype.testBulletRef = function() {
    var n = bulletRef("shot", 1, 2, 3, "4");
    assertTrue(n instanceof BulletML.BulletRef);
    assertEquals(n.label, "shot");
    assertEquals(n.params[0], 1);
    assertEquals(n.params[1], 2);
    assertEquals(n.params[2], 3);
    assertEquals(n.params[3], "4");
};

ParseTest2.prototype.testFireRef = function() {
    var n = fireRef("shot", 1, 2, 3, "4");
    assertTrue(n instanceof BulletML.FireRef);
    assertEquals(n.label, "shot");
    assertEquals(n.params[0], 1);
    assertEquals(n.params[1], 2);
    assertEquals(n.params[2], 3);
    assertEquals(n.params[3], "4");
};
