"use strict";

BulletMLTest = TestCase("BulletMLTest");

BulletMLTest.prototype.testBuild = function() {
	var result = BulletML.build("<bulletml></bulletml>");
	assertEquals("none", result.type);
};

BulletMLTest.prototype.testTypeDefaultValue = function() {
	var result = BulletML.build("<bulletml type='horizontal'></bulletml>");
	assertEquals("horizontal", result.type);
};

BulletMLTest.prototype.testBuildXml = function() {
	var dom = new DOMParser().parseFromString(
			"<bulletml type='horizontal'></bulletml>", "text/xml");
	var result = BulletML.build(dom);
	assertEquals("horizontal", result.type);
};

BulletMLTest.prototype.testBuildTopLevelActions = function() {
	var result = BulletML
			.build("<bulletml><action label='a1'/><action label='a2'/><action label='a3'/></bulletml>");
	assertEquals("a1", result.actions[0].label);
	assertEquals("a2", result.actions[1].label);
	assertEquals("a3", result.actions[2].label);
	assertEquals(result, result.actions[0].root);
	assertEquals(result, result.actions[1].root);
	assertEquals(result, result.actions[2].root);
};

BulletMLTest.prototype.testBuildTopAction = function() {
	var result = BulletML
			.build("<bulletml><action label='top'><fire><bullet/></fire></action></bulletml>");
	assertNotUndefined(result.topAction);
};

BulletMLTest.prototype.testFindAction = function() {
	var result = BulletML
			.build("<bulletml><action label='a1'/><action label='a2'/><action label='a3'/></bulletml>");
	assertEquals("a1", result.findAction("a1").label);
	assertEquals("a2", result.findAction("a2").label);
	assertEquals("a3", result.findAction("a3").label);
	assertUndefined(result.findAction("xxx"));
};

BulletMLTest.prototype.testBuildTopLebelBullets = function() {
	var result = BulletML
			.build("<bulletml><bullet label='b1'/><bullet label='b2'/><bullet label='b3'/></bulletml>");
	assertEquals("b1", result.bullets[0].label);
	assertEquals("b2", result.bullets[1].label);
	assertEquals("b3", result.bullets[2].label);
	assertEquals(result, result.bullets[0].root);
	assertEquals(result, result.bullets[1].root);
	assertEquals(result, result.bullets[2].root);
};

BulletMLTest.prototype.testBuildTopLebelFires = function() {
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
	assertEquals("b", result.fires[0].bulletRef);
	assertEquals("b", result.fires[1].bulletRef);
	assertEquals("b", result.fires[2].bulletRef);
};

BulletMLTest.prototype.testParseBullet = function() {
	var result = BulletML.build("<bulletml><bullet label='b1'></bulletml>");
	var b1 = result.findBullet("b1");
	assertNotUndefined(b1);
	assertEquals("aim", b1.direction.type);
	assertEquals("0", b1.direction.value);
	assertEquals("absolute", b1.speed.type);
	assertEquals("1", b1.speed.value);
};

BulletMLTest.prototype.testParseDirection = function() {
	var result = BulletML.build("<bulletml><bullet label='b1'>"
			+ "<direction type='relative'>180</direction>"
			+ "</bullet></bulletml>");
	var b1 = result.findBullet("b1");
	assertNotUndefined(b1);
	assertEquals("relative", b1.direction.type);
	assertEquals("180", b1.direction.value);
};

BulletMLTest.prototype.testParseSpeed = function() {
	var result = BulletML.build("<bulletml><bullet label='b1'>"
			+ "<speed type='sequence'>(2+$1)*0.3</speed>"
			+ "</bullet></bulletml>");
	var b1 = result.findBullet("b1");
	assertNotUndefined(b1);
	assertEquals("sequence", b1.speed.type);
	assertEquals("(2+$1)*0.3", b1.speed.value);
};
