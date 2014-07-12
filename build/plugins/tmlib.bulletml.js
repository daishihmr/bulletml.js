/**
 * @namespace
 */
tm.bulletml = tm.bulletml || {};

(function() {

bulletml.runner.DEFAULT_CONFIG.createNewBullet = function(runner, spec) {
    var bullet = tm.bulletml.Bullet(runner);
};

tm.define("tm.bulletml.Bullet", {
    superClass: "tm.app.Object2D",
    init: function(runner) {
        this.superInit();
        this.runner = runner;
        this.setPosition(this.runner.x, this.runner.y);
        this.runner.onVanish = function() {
            bullet.remove();
        };
    },
    update: function() {
        this.runner.update();
        this.setPosition(this.runner.x, this.runner.y);
    }
});

tm.app.Object2D.prototype.startDanmaku = function(root, config) {
    var runner = root.createRunner(config);
    runner.x = this.x;
    runner.y = this.y;
    var enterframeListener = function() {
        runner.x = this.x;
        runner.y = this.y;
        runner.update();
        this.setPosition(runner.x, runner.y);
    };
    enterframeListener.isDanmaku = true;
    this.on("enterframe", enterframeListener);
};

tm.app.Object2D.prototype.stopDanmaku = function() {
    if (this.hasEventListener("enterframe")) {
        var copied = [].concat(this._listeners["enterframe"]);
        for (var i = 0; i < copied.length; i++) {
            if (copied[i].isDanmaku) {
                this.off("enterframe", copied[i]);
            }
        }
    }
};

})();
