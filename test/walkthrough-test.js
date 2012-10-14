"use strict";

var WtTest = TestCase("WalkthroughTest");

WtTest.prototype.testBasic1 = function() {
    var bulletml = BulletML
            .build("<bulletml><action label='top'><fire><bullet/></fire></action></bulletml>");
    var seq = bulletml.createWalker();
    var fire = seq.next();
    assertFalse(seq.next());
    assertEquals("fire", fire.commandName);
};

WtTest.prototype.testBasic2 = function() {
    var bulletml = BulletML
            .build("<bulletml>"
                    + "<action label='top'><repeat><times>2</times><action><fire><bullet/></fire><vanish/></action></repeat></action>"
                    + "</bulletml>");
    var walker = bulletml.createWalker();
    assertEquals("fire", walker.next().commandName);
    assertEquals("vanish", walker.next().commandName);
    assertEquals("fire", walker.next().commandName);
    assertEquals("vanish", walker.next().commandName);
    assertFalse(walker.next());
};

// ActionRef, FireRefはcall. BulletRefはget.

// next:function() {
// var next = this.cur.getNext();
// if (!next) { return null; }
// this.cur = next;
// return cur;
// },

// # Command
// getNext:function() {
// return this._next;
// }

// # Action
// getNext:function() {
// return this.commands[0];
// }

// # Repeat
// this.action.returnNode = this;
// getNext:function() {
// if (this.loopCount == -1) { // 初めて来た
// this.loopCount = 0;
// this.timesNum = eval(this.times); // この時点で繰り返し回数を評価
// } else {
// this.loopCount += 1;
// }
// if (this.loopCount < this.timesNum) {
// return this.action;
// } else {
// this.loopCount = -1;
// return this._next;
// }
// }

// # ActionRef
// getNext:function() {
// var tar = this.root.findAction(this.label).clone();
// tar.commands.push(this.returnNode);
// }
