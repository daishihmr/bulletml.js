"use strict";

var ParseTest = TestCase("ParseTest");

ParseTest.prototype.testBuild = function() {
	var result = BulletML.build("<bulletml></bulletml>");
	assertEquals("none", result.type);
};

ParseTest.prototype.testType = function() {
	var result = BulletML.build("<bulletml type='horizontal'></bulletml>");
	assertEquals("horizontal", result.type);
};

ParseTest.prototype.testBuildXml = function() {
	var dom = new DOMParser()
			.parseFromString(
					"<?xml version='1.0'?>\n"
							+ "<!DOCTYPE bulletml SYSTEM 'http://www.asahi-net.or.jp/~cs8k-cyu/bulletml/bulletml.dtd'>\n"
							+ "\n"
							+ "<bulletml xmlns='http://www.asahi-net.or.jp/~cs8k-cyu/bulletml'>\n"
							+ "</bulletml>", "application/xml");
	var result = BulletML.build(dom);
	assertEquals("none", result.type);
};

ParseTest.prototype.testBuildTopLevelActions = function() {
	var result = BulletML
			.build("<bulletml><action label='a1'/><action label='a2'/><action label='a3'/></bulletml>");
	assertEquals("a1", result.actions[0].label);
	assertEquals("a2", result.actions[1].label);
	assertEquals("a3", result.actions[2].label);
	assertEquals(result, result.actions[0].root);
	assertEquals(result, result.actions[1].root);
	assertEquals(result, result.actions[2].root);
};

ParseTest.prototype.testBuildTopAction = function() {
	var result = BulletML
			.build("<bulletml><action label='top'><fire><bullet/></fire></action></bulletml>");
	assertNotUndefined(result.topAction);
};

ParseTest.prototype.testRepeat2ActionRef = function() {
	var result = BulletML
			.build("<bulletml>"
					+ "<action label='top'><repeat><times>5</times>"
					+ "<action><actionRef label='sub'/><actionRef label='sub'/></action></action>"
					+ "<action label='sub'></actoin></bulletml>");
	var repeat = result.topAction.commands[0];
	assertEquals("repeat", repeat.commandName);
	assertEquals(2, repeat.action.commands.length);
	assertEquals("actionRef", repeat.action.commands[0].commandName);
	assertEquals("actionRef", repeat.action.commands[1].commandName);
};

ParseTest.prototype.testFindAction = function() {
	var result = BulletML
			.build("<bulletml><action label='a1'/><action label='a2'/><action label='a3'/></bulletml>");
	assertEquals("a1", result.findAction("a1").label);
	assertEquals("a2", result.findAction("a2").label);
	assertEquals("a3", result.findAction("a3").label);
	assertUndefined(result.findAction("xxx"));
};

ParseTest.prototype.testBuildTopLevelBullets = function() {
	var result = BulletML
			.build("<bulletml><bullet label='b1'/><bullet label='b2'/><bullet label='b3'/></bulletml>");
	assertEquals("b1", result.bullets[0].label);
	assertEquals("b2", result.bullets[1].label);
	assertEquals("b3", result.bullets[2].label);
	assertEquals(result, result.bullets[0].root);
	assertEquals(result, result.bullets[1].root);
	assertEquals(result, result.bullets[2].root);
};

ParseTest.prototype.testBuildTopLevelFires = function() {
	var result = BulletML
			.build("<bulletml><fire label='f1'><bulletRef label='b'/></fire>"
					+ "<fire label='f2'><bulletRef label='b'/></fire>"
					+ "<fire label='f3'><bulletRef label='b'/></fire></bulletml>");
	assertEquals("f1", result.fires[0].label);
	assertEquals("f2", result.fires[1].label);
	assertEquals("f3", result.fires[2].label);
	assertEquals(result, result.fires[0].root);
	assertEquals(result, result.fires[1].root);
	assertEquals(result, result.fires[2].root);
	assertEquals("b", result.fires[0].bullet.label);
	assertEquals("b", result.fires[1].bullet.label);
	assertEquals("b", result.fires[2].bullet.label);
};

ParseTest.prototype.testParseBullet1 = function() {
	var result = BulletML.build("<bulletml><bullet label='b1'/></bulletml>");
	var b1 = result.findBullet("b1");
	assertNotUndefined(b1);
	assertEquals("aim", b1.direction.type);
	assertEquals("0", b1.direction.value);
	assertEquals("absolute", b1.speed.type);
	assertEquals("1", b1.speed.value);
};

ParseTest.prototype.testParseBullet2 = function() {
	var result = BulletML.build("<bulletml><bullet label='b1'>"
			+ "<action><fire><bullet/></fire></action>"
			+ "<actionRef label='action2'/>"
			+ "<action><changeDirection><direction>10</direction>"
			+ "<term>20</term></changeDirection></action>"
			+ "</bullet></bulletml>");
	var b1 = result.findBullet("b1");
	assertEquals(3, b1.actions.length);
	assertEquals("fire", b1.actions[0].commands[0].commandName);
	assertEquals("actionRef", b1.actions[1].commandName);
	assertEquals("changeDirection", b1.actions[2].commands[0].commandName);
};

ParseTest.prototype.testParseDirection = function() {
	var result = BulletML.build("<bulletml><bullet label='b1'>"
			+ "<direction type='relative'>180</direction>"
			+ "</bullet></bulletml>");
	var b1 = result.findBullet("b1");
	assertNotUndefined(b1);
	assertEquals("relative", b1.direction.type);
	assertEquals("180", b1.direction.value);
};

ParseTest.prototype.testParseSpeed = function() {
	var result = BulletML.build("<bulletml><bullet label='b1'>"
			+ "<speed type='sequence'>(2+$1)*0.3</speed>"
			+ "</bullet></bulletml>");
	var b1 = result.findBullet("b1");
	assertNotUndefined(b1);
	assertEquals("sequence", b1.speed.type);
	assertEquals("(2+$1)*0.3", b1.speed.value);
};

ParseTest.prototype.testParseFire1 = function() {
	var result = BulletML.build("<bulletml><action label='top'>"
			+ "<fire><bullet/></fire></action></bulletml>");
	var fire = result.topAction.commands[0];
	assertNotUndefined(fire.bullet);
	assertNull(fire.direction);
	assertNull(fire.speed);
};

ParseTest.prototype.testParseFire2 = function() {
	var result = BulletML.build("<bulletml><action label='top'><fire>"
			+ "<direction type='relative'>180</direction>"
			+ "<speed type='sequence'>(2+$1)*0.3</speed><bullet/></fire>"
			+ "</action></bulletml>");
	var fire = result.topAction.commands[0];
	assertNotUndefined(fire.bullet);
	assertEquals("relative", fire.direction.type);
	assertEquals("180", fire.direction.value);
	assertEquals("sequence", fire.speed.type);
	assertEquals("(2+$1)*0.3", fire.speed.value);
};

ParseTest.prototype.testParseChangeDirection1 = function() {
	var result = BulletML
			.build("<bulletml><bullet label='b'><action><changeDirection>"
					+ "<direction>10</direction><term>20</term></changeDirection>"
					+ "</action></bullet></bulletml>");
	var changeDirection = result.findBullet("b").actions[0].commands[0];
	assertNotUndefined(changeDirection);
	assertEquals("10", changeDirection.direction.value);
	assertEquals("20", changeDirection.term);
};

ParseTest.prototype.testParseChangeDirection2 = function() {
	var result = BulletML
			.build("<bulletml><bullet label='b'><action><changeDirection>"
					+ "<direction type='absolute'>10+10</direction><term>20+20</term></changeDirection>"
					+ "</action></bullet></bulletml>");
	var changeDirection = result.findBullet("b").actions[0].commands[0];
	assertNotUndefined(changeDirection);
	assertEquals("10+10", changeDirection.direction.value);
	assertEquals("absolute", changeDirection.direction.type);
	assertEquals("20+20", changeDirection.term);
};

ParseTest.prototype.testParseChangeSpeed = function() {
	var result = BulletML
			.build("<bulletml><bullet label='b'><action><actionRef label='other'/>"
					+ "<changeSpeed><speed>11</speed><term>24</term></changeSpeed>"
					+ "</action></bullet></bulletml>");
	var changeSpeed = result.findBullet("b").actions[0].commands[1];
	assertNotUndefined(changeSpeed);
	assertEquals("11", changeSpeed.speed.value);
	assertEquals("24", changeSpeed.term);
};

ParseTest.prototype.testParseAccel = function() {
	var result = BulletML
			.build("<bulletml><action label='top'>"
					+ "<fire><bullet><actionRef label='a'/>"
					+ "<action><action><accel><horizontal type='absolute'>5+5</horizontal>"
					+ "<vertical type='relative'>3+8</vertical>"
					+ "<term>9+$rand*50</term></accel></action></action>"
					+ "</bullet></fire></action></bulletml>");
	var accel = result.topAction.commands[0].bullet.actions[1].commands[0].commands[0];
	assertEquals("accel", accel.commandName);
	assertEquals("absolute", accel.horizontal.type);
	assertEquals("5+5", accel.horizontal.value);
	assertEquals("relative", accel.vertical.type);
	assertEquals("3+8", accel.vertical.value);
	assertEquals("9+$rand*50", accel.term);
};

ParseTest.prototype.testParseWait = function() {
	var result = BulletML
			.build("<bulletml><action label='top'><wait>120</wait></action></bulletml>");
	var wait = result.topAction.commands[0];
	assertEquals("wait", wait.commandName);
	assertEquals("120", wait.value);
};

ParseTest.prototype.testParseVanish = function() {
	var result = BulletML
			.build("<bulletml><action label='top'><vanish/></action></bulletml>");
	var wait = result.topAction.commands[0];
	assertEquals("vanish", wait.commandName);
};

ParseTest.prototype.testParseRepeat1 = function() {
	var result = BulletML.build("<bulletml><action label='top'><repeat>"
			+ "<times>120</times><actionRef label='a'/>"
			+ "</repeat></action></bulletml>");
	var repeat = result.topAction.commands[0];
	assertEquals("repeat", repeat.commandName);
	assertEquals("actionRef", repeat.action.commandName);
};

ParseTest.prototype.testParseRepeat2 = function() {
	var result = BulletML.build("<bulletml><action label='top'><repeat>"
			+ "<times>120</times><action><vanish/></action>"
			+ "</repeat></action></bulletml>");
	var repeat = result.topAction.commands[0];
	assertEquals("repeat", repeat.commandName);
	assertEquals("vanish", repeat.action.commands[0].commandName);
};

ParseTest.prototype.testParseActionRef = function() {
	var result = BulletML.build("<bulletml><action label='top'>"
			+ "<actionRef label='aaa'><param>1</param>"
			+ "<param>1</param><param>2</param><param>3</param>"
			+ "<param>5</param><param>8</param><param>13</param></actionRef>"
			+ "</action><action label='aaa'></action></bulletml>");
	var actionRef = result.topAction.commands[0];
	assertEquals("actionRef", actionRef.commandName);
	assertEquals("aaa", actionRef.label);
	assertEquals(7, actionRef.params.length);
	assertEquals(1, actionRef.params[0]);
	assertEquals(1, actionRef.params[1]);
	assertEquals(2, actionRef.params[2]);
	assertEquals(3, actionRef.params[3]);
	assertEquals(5, actionRef.params[4]);
	assertEquals(8, actionRef.params[5]);
	assertEquals(13, actionRef.params[6]);
};

ParseTest.prototype.testParseBulletRef = function() {
	var result = BulletML.build("<bulletml><action label='top'><fire>"
			+ "<bulletRef label='b'><param>3</param><param>1</param>"
			+ "<param>4</param><param>1</param><param>5</param>"
			+ "</bulletRef></fire></action></bulletml>");
	var bulletRef = result.topAction.commands[0].bullet;
	assertEquals("b", bulletRef.label);
	assertEquals(5, bulletRef.params.length);
	assertEquals("3", bulletRef.params[0]);
	assertEquals("1", bulletRef.params[1]);
	assertEquals("4", bulletRef.params[2]);
	assertEquals("1", bulletRef.params[3]);
	assertEquals("5", bulletRef.params[4]);
};

ParseTest.prototype.testParseFireRef = function() {
	var result = BulletML.build("<bulletml><action label='top'>"
			+ "<fireRef label='f'><param>5</param><param>10</param>"
			+ "</fireRef></action></bulletml>");
	var fireRef = result.topAction.commands[0];
	assertEquals("fireRef", fireRef.commandName);
	assertEquals("f", fireRef.label);
	assertEquals(2, fireRef.params.length);
	assertEquals("5", fireRef.params[0]);
	assertEquals("10", fireRef.params[1]);
};
