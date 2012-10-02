"use strict";

var RuntimeTest = TestCase("RuntimeTest");

RuntimeTest.prototype.testVisitor1 = function() {
	var bulletml = BulletML.build("<bulletml><action label='top'>"
			+ "<fire><bulletRef label='bullet1'/></fire>"
			+ "<fire><bulletRef label='bullet2'/></fire>"
			+ "<fire><bulletRef label='bullet3'/></fire>"
			+ "<fire><bulletRef label='bullet4'/></fire>"
			+ "</action></bulletml>");
	var commands = bulletml.tick();
	assertEquals(4, commands.length);
	assertEquals("bullet1", commands[0].bullet.label);
	assertEquals("bullet2", commands[1].bullet.label);
	assertEquals("bullet3", commands[2].bullet.label);
	assertEquals("bullet4", commands[3].bullet.label);
};

RuntimeTest.prototype.testVisitor2 = function() {
	var bulletml = BulletML.build("<bulletml><action label='top'>"
			+ "<action><fire><bulletRef label='bullet1'/></fire>"
			+ "<fire><bulletRef label='bullet2'/></fire></action>"
			+ "<action><fire><bulletRef label='bullet3'/></fire></action>"
			+ "<fire><bulletRef label='bullet4'/></fire>"
			+ "</action></bulletml>");
	var commands = bulletml.tick();
	assertEquals(4, commands.length);
	assertEquals("bullet1", commands[0].bullet.label);
	assertEquals("bullet2", commands[1].bullet.label);
	assertEquals("bullet3", commands[2].bullet.label);
	assertEquals("bullet4", commands[3].bullet.label);
};
