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
