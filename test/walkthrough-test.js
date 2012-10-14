"use strict";

var WtTest = TestCase("WalkthroughTest");

WtTest.prototype.testBasic1 = function() {
    var bulletml = BulletML
            .build("<bulletml><action label='top'><fire><bullet/></fire></action></bulletml>");
    var script = bulletml._scriptalize();
    assertEquals("this.top=function(){" //
            + "this.fire(null,null,this.bullet(this.direction(),this.speed(),null));" //
            + "};");
};

WtTest.prototype.testBasic2 = function() {
    var bulletml = BulletML
            .build("<bulletml>"
                    + "<action label='top'><repeat><times>2</times><action><fire><bullet/></fire><vanish/></action></repeat></action>"
                    + "</bulletml>");
    var script = bulletml._scriptalize();
    assertEquals("this.top=function(){" //
            + "this.repeat(2,function(){" //
            + "this.fire(null,null,this.bullet(this.direction(),this.speed(), null));" //
            + "this.vanish();" //
            + "});" //
            + "};");
};

WtTest.prototype.testBulletRef = function() {
    var bulletml = BulletML
            .build("<bulletml><action label='top'><fire><bulletRef label='b1'/></fire></action>"
                    + "<bullet label='b1'><action><wait>10</wait><vanish/></action></bullet></bulletml>");
    var script = bulletml._scriptalize();
    assertEquals("this.top=function(){" //
            + "this.fire(null,null,this.b1());" //
            + "};" //
            + "this.b1=function($1,$2,$3,$4,$5){" //
            + "return this.bullet(this.direction(),this.speed(),function(){" //
            + "this.wait(10);" //
            + "this.vanish();" //
            + "});" //
            + "};");
};

WtTest.prototype.testParameter = function() {
    var bulletml = BulletML
            .build("<bulletml>"
                    + "<action label='top'><fire><bulletRef label='b1'><param>$rand</param><param>4</param></bulletRef></fire></action>"
                    + "<bullet label='b1'><speed>$1</speed><action><wait>$2</wait><vanish/></action></bullet>"
                    + "</bulletml>");
    var script = bulletml._scriptalize();
    assertEquals("this.top=function(){" //
            + "this.fire(null,null,this.b1(Math.random(),4));" //
            + "};" //
            + "this.b1=function($1,$2,$3,$4,$5){" //
            + "return this.bullet(this.direction(),this.speed($1),function(){" //
            + "this.wait($2);" //
            + "this.vanish();" //
            + "});" //
            + "};");
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
