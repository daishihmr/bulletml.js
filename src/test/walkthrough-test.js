"use strict";

var WtTest = TestCase("WtTest");

WtTest.prototype.testEval = function() {
    var walker = new BulletML.Walker(null, 0.5);
    walker._localScope = {
        $1 : 1,
        $2 : 2
    };
    var exp = "$1 + $2 + $rank";
    assertEquals(3.5, walker.evalParam(exp));
    assertNotUndefined(walker.evalParam("$rand*5"));
    assertNotNaN(walker.evalParam("$rand*5"));
};

WtTest.prototype.testBasic1 = function() {
    var bulletml = BulletML
            .build("<bulletml><action label='top'><fire><bullet/></fire></action></bulletml>");
    var walker = bulletml.getWalker("top");
    assertEquals("fire", walker.next().commandName);
    assertNull(walker.next());
};

WtTest.prototype.testBasic2 = function() {
    var bulletml = BulletML
            .build("<bulletml>"
                    + "<action label='top'>"
                    + "<repeat><times>2</times><action><fire><bullet/></fire><vanish/></action></repeat>"
                    + "<changeSpeed><speed>100</speed></changeSpeed>"
                    + "</action></bulletml>");
    var walker = bulletml.getWalker("top");
    assertEquals("fire", walker.next().commandName);
    assertEquals("vanish", walker.next().commandName);
    assertEquals("fire", walker.next().commandName);
    assertEquals("vanish", walker.next().commandName);
    assertEquals("changeSpeed", walker.next().commandName);
    assertNull(walker.next());
};

WtTest.prototype.testRepeatVariableTimes = function() {
    var bulletml = BulletML
            .build("<bulletml>"
                    + "<action label='top'><actionRef label='rep'><param>3</param></actionRef></action>"
                    + "<action label='rep'><repeat><times>$1</times><action><vanish/></action></repeat>"
                    + "<changeSpeed><speed>100</speed></changeSpeed>"
                    + "</action></bulletml>");
    var walker = bulletml.getWalker("top");
    assertEquals("vanish", walker.next().commandName);
    assertEquals("vanish", walker.next().commandName);
    assertEquals("vanish", walker.next().commandName);
    assertEquals("changeSpeed", walker.next().commandName);
    assertNull(walker.next());
};

WtTest.prototype.testActionRefReturn = function() {
    var bulletml = BulletML
            .build("<bulletml>"
                    + "<action label='top'><actionRef label='outer'><param>1</param><param>2</param></actionRef></action>"
                    + "<action label='outer'><wait>$1</wait><actionRef label='inner'><param>$2</param></actionRef><wait>$1</wait></action>"
                    + "<action label='inner'><wait>$1</wait></action>"
                    + "</bulletml>");
    var walker = bulletml.getWalker("top");
    var wait1 = walker.next();
    assertEquals("wait", wait1.commandName);
    assertEquals(1, wait1.value);
    var wait2 = walker.next();
    assertEquals("wait", wait2.commandName);
    assertEquals(2, wait2.value);
    var wait3 = walker.next();
    assertEquals("wait", wait3.commandName);
    assertEquals(1, wait3.value);
    assertNull(walker.next());
};

WtTest.prototype.testChangeDirection = function() {
    var bulletml = BulletML
            .build("<bulletml>"
                    + "<action label='top'><changeDirection><direction>$rank+4</direction><term>$rank+3</term></changeDirection></action></bulletml>");
    var walker = bulletml.getWalker("top", 1.0);
    var cd = walker.next();
    console.log(cd);
    assertEquals("changeDirection", cd.commandName);
    assertEquals(5, cd.direction.value);
    assertEquals(4, cd.term);
};

WtTest.prototype.testChangeSpeed = function() {
    var bulletml = BulletML
            .build("<bulletml>"
                    + "<action label='top'><changeSpeed><speed>$rank+4</speed><term>$rank+3</term></changeSpeed></action></bulletml>");
    var walker = bulletml.getWalker("top", 1.0);
    var cs = walker.next();
    assertEquals("changeSpeed", cs.commandName);
    assertEquals(5, cs.speed.value);
    assertEquals(4, cs.term);
};

WtTest.prototype.testAccel = function() {
    var bulletml = BulletML
            .build("<bulletml>"
                    + "<action label='top'>"
                    + "<accel><horizontal>$rank+4</horizontal><vertical>$rank+5</vertical><term>$rank+3</term></accel>"
                    + "</action></bulletml>");
    var walker = bulletml.getWalker("top", 1.0);
    var ac = walker.next();
    assertEquals("accel", ac.commandName);
    assertEquals(5, ac.horizontal.value);
    assertEquals(6, ac.vertical.value);
    assertEquals(4, ac.term);
};

WtTest.prototype.testFireBullet = function() {
    var bulletml = BulletML
            .build("<bulletml><action label='top'><fire><bullet/></fire></action></bulletml>");
    var walker = bulletml.getWalker("top");
    var f = walker.next();
    assertEquals("fire", f.commandName);
    assertEquals("aim", f.bullet.direction.type);
    assertEquals(0, f.bullet.direction.value);
    assertEquals("absolute", f.bullet.speed.type);
    assertEquals(1, f.bullet.speed.value);
};

WtTest.prototype.testFireBullet2 = function() {
    var bulletml = BulletML.build("<bulletml><action label='top'><fire>"
            + "  <direction type='relative'>30</direction>"
            + "  <speed type='sequence'>$rank*2</speed>"
            + "  <bullet label='bullet'>"
            + "    <direction type='absolute'>$rank*5</direction>"
            + "    <speed type='sequence'>$rank*10</speed>"
            + "  </bullet></fire></action></bulletml>");
    var walker = bulletml.getWalker("top", 0.1);
    var f = walker.next();
    assertEquals("fire", f.commandName);
    assertEquals("relative", f.direction.type);
    assertEquals(30, f.direction.value);
    assertEquals("sequence", f.speed.type);
    assertEquals(0.2, f.speed.value);
    assertEquals("absolute", f.bullet.direction.type);
    assertEquals(0.5, f.bullet.direction.value);
    assertEquals("sequence", f.bullet.speed.type);
    assertEquals(1, f.bullet.speed.value);
};

WtTest.prototype.testFireBulletsWalker = function() {
    var bulletml = BulletML.build("<bulletml><action label='top'><fire>"
            + "<bullet><action><wait>10</wait><vanish/></action></bullet>"
            + "</fire></action></bulletml>");
    var walker = bulletml.getWalker("top");
    var f = walker.next();
    var b = f.bullet;
    var bw = b.getWalker();
    assertEquals("wait", bw.next().commandName);
    assertEquals("vanish", bw.next().commandName);
};

WtTest.prototype.testFireBulletsWalkerVariable = function() {
    var bulletml = BulletML
            .build("<bulletml>"
                    + "<action label='top'><actionRef label='f'><param>5</param><param>10</param></actionRef></action>"
                    + "<action label='f'><fire>"
                    + "<bullet><action><wait>$1</wait><changeDirection><direction>10</direction><term>$2</term></changeDirection></action></bullet>"
                    + "</fire></action></bulletml>");
    var walker = bulletml.getWalker("top");
    var f = walker.next();
    var b = f.bullet;

    var bw = b.getWalker();
    var w = bw.next();
    assertEquals("wait", w.commandName);
    assertEquals(5, w.value);
    var cd = bw.next();
    assertEquals("changeDirection", cd.commandName);
    assertEquals(10, cd.term);
};

WtTest.prototype.testFireBulletRef = function() {
    var bulletml = BulletML
            .build("<bulletml><action label='top'><fire><bulletRef label='b'/></fire></action>"
                    + "<bullet label='b'/></bulletml>");
    var walker = bulletml.getWalker("top");
    var f = walker.next();
    assertEquals("fire", f.commandName);
    assertEquals("aim", f.bullet.direction.type);
    assertEquals(0, f.bullet.direction.value);
    assertEquals("absolute", f.bullet.speed.type);
    assertEquals(1, f.bullet.speed.value);
};

WtTest.prototype.testFireBulletRef2 = function() {
    var bulletml = BulletML
            .build("<bulletml><action label='top'><fire>"
                    + "  <direction type='relative'>30</direction>"
                    + "  <speed type='sequence'>$rank*2</speed><bulletRef label='bullet'/></fire></action>"
                    + "  <bullet label='bullet'>"
                    + "    <direction type='absolute'>$rank*5</direction>"
                    + "    <speed type='sequence'>$rank*10</speed>"
                    + "  </bullet></bulletml>");
    var walker = bulletml.getWalker("top", 0.1);
    var f = walker.next();
    assertEquals("fire", f.commandName);
    assertEquals("relative", f.direction.type);
    assertEquals(30, f.direction.value);
    assertEquals("sequence", f.speed.type);
    assertEquals(0.2, f.speed.value);
    assertEquals("absolute", f.bullet.direction.type);
    assertEquals(0.5, f.bullet.direction.value);
    assertEquals("sequence", f.bullet.speed.type);
    assertEquals(1, f.bullet.speed.value);
};

WtTest.prototype.testFireBulletsRef3 = function() {
    var bulletml = BulletML
            .build("<bulletml>"
                    + "<action label='top'><fire><bulletRef label='b'><param>10</param><param>20</param></bulletRef></fire></action>"
                    + "<bullet label='b'><action><wait>$1</wait><changeDirection><direction>10</direction><term>$2</term></changeDirection></action></bullet>"
                    + "</bulletml>");
    var walker = bulletml.getWalker("top");
    var f = walker.next();
    var b = f.bullet;

    var bw = b.getWalker();
    var w = bw.next();
    assertEquals("wait", w.commandName);
    assertEquals(10, w.value);
    var cd = bw.next();
    assertEquals("changeDirection", cd.commandName);
    assertEquals(10, cd.direction.value);
    assertEquals(20, cd.term);
};

WtTest.prototype.testFireBulletsRefDeep = function() {
    var bulletml = BulletML
            .build("<bulletml>"
                    + "<action label='top'><actionRef label='shot'><param>5</param><param>4</param><param>3</param></actionRef></action>"
                    + "<action label='shot'><fire><bulletRef label='b'><param>$2</param><param>$1</param></bulletRef></fire><wait>$3</wait></action>"
                    + "<bullet label='b'><action><wait>$1</wait><changeDirection><direction>0</direction><term>$2</term></changeDirection></action></bullet>"
                    + "</bulletml>");
    var walker = bulletml.getWalker("top");
    var fire = walker.next();
    var wait = walker.next();
    assertEquals("fire", fire.commandName);
    assertEquals("wait", wait.commandName);
    assertEquals(3, wait.value);

    var b = fire.bullet;

    var bwalker = b.getWalker();
    var bwait = bwalker.next();
    assertEquals("wait", bwait.commandName);
    assertEquals(4, bwait.value);
    var bcd = bwalker.next();
    assertEquals("changeDirection", bcd.commandName);
    assertEquals(0, bcd.direction.value);
    assertEquals(5, bcd.term);
};

WtTest.prototype.testFireRef = function() {
    var bulletml = BulletML
            .build("<bulletml>"
                    + "<action label='top'><wait>5</wait><fireRef label='f'/><wait>10</wait></action>"
                    + "<fire label='f'><direction type='absolute'>10</direction><speed type='sequence'>1</speed><bullet/></fire>"
                    + "</bulletml>");
    var walker = bulletml.getWalker("top");
    var wait5 = walker.next();
    var fire = walker.next();
    var wait10 = walker.next();
    assertEquals("wait", wait5.commandName);
    assertEquals(5, wait5.value);
    assertEquals("fire", fire.commandName);
    assertEquals("absolute", fire.direction.type);
    assertEquals(10, fire.direction.value);
    assertEquals("sequence", fire.speed.type);
    assertEquals(1, fire.speed.value);
    assertEquals("wait", wait10.commandName);
    assertEquals(10, wait10.value);
};

WtTest.prototype.testFireRef2 = function() {
    var bulletml = BulletML
            .build("<bulletml>"
                    + "<action label='top'><wait>5</wait><fireRef label='f'><param>3</param><param>6</param></fireRef><wait>10</wait></action>"
                    + "<fire label='f'><direction type='absolute'>$2</direction><speed type='sequence'>$1</speed><bullet/></fire>"
                    + "</bulletml>");
    var walker = bulletml.getWalker("top");
    var wait5 = walker.next();
    var fire = walker.next();
    var wait10 = walker.next();
    assertEquals("wait", wait5.commandName);
    assertEquals(5, wait5.value);
    assertEquals("fire", fire.commandName);
    assertEquals("absolute", fire.direction.type);
    assertEquals(6, fire.direction.value);
    assertEquals("sequence", fire.speed.type);
    assertEquals(3, fire.speed.value);
    assertEquals("wait", wait10.commandName);
    assertEquals(10, wait10.value);
};

WtTest.prototype.testXABossWinder = function() {
    var bulletml = BulletML
            .build('<bulletml><bullet label="winderBullet"><speed>3</speed></bullet><fire label="fireWinder"><direction type="sequence">$1</direction><bulletRef label="winderBullet" /></fire><action label="roundWinder"><fireRef label="fireWinder"><param>$1</param></fireRef><repeat><times>11</times><action><fireRef label="fireWinder"><param>30</param></fireRef></action></repeat><wait>5</wait></action><action label="winderSequence"><repeat><times>12</times><actionRef label="roundWinder"><param>30</param></actionRef></repeat><repeat><times>12</times><actionRef label="roundWinder"><param>$1</param></actionRef></repeat><repeat><times>12</times><actionRef label="roundWinder"><param>30</param></actionRef></repeat></action><action label="top1"><fire><direction type="absolute">2</direction><bulletRef label="winderBullet" /></fire><actionRef label="winderSequence"><param>31</param></actionRef></action><action label="top2"><fire><direction type="absolute">-2</direction><bulletRef label="winderBullet" /></fire><actionRef label="winderSequence"><param>29</param></actionRef></action></bulletml>');
    var w1 = bulletml.getWalker("top1");
    console.log(bulletml.findAction("roundWinder"));
    var firstFire = w1.next();
    var roundWinder0 = [];
    for ( var i = 0; i < 12 * 12; i++) {
        roundWinder0[i] = w1.next();
    }
    var roundWinder1 = [];
    for ( var i = 0; i < 12 * 12; i++) {
        roundWinder1[i] = w1.next();
    }
    var roundWinder2 = [];
    for ( var i = 0; i < 12 * 12; i++) {
        roundWinder2[i] = w1.next();
    }

};

WtTest.prototype.testLoopCount1 = function() {
    var bulletml = BulletML.build(
        '<bulletml>\
            <action label="top">\
                <repeat>\
                    <times>10</times>\
                    <action>\
                        <fire><bullet/></fire>\
                    </action>\
                </repeat>\
            </action>\
        </bulletml>'
    );
    var walker = bulletml.getWalker('top');

    var commands = [];
    var cmd;
    while ((cmd = walker.next()) != null) {
        commands.push(cmd.commandName);
    }

    assertFalse(commands.some(function(c) { c != 'fire' }));
    assertEquals(10, commands.length);
};

WtTest.prototype.testLoopCount2 = function() {
    var bulletml = BulletML.build(
        '<bulletml>\
            <action label="top">\
                <repeat>\
                    <times>10.5</times>\
                    <action>\
                        <fire><bullet/></fire>\
                    </action>\
                </repeat>\
            </action>\
        </bulletml>'
    );
    var walker = bulletml.getWalker('top');

    var commands = [];
    var cmd;
    while ((cmd = walker.next()) != null) {
        commands.push(cmd.commandName);
    }

    assertFalse(commands.some(function(c) { c != 'fire' }));
    assertEquals(10, commands.length);
};
