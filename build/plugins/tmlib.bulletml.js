/**
 * @namespace
 */
tm.bulletml = tm.bulletml || {};

(function() {

tm.define("tm.bulletml.Bullet", {
    superClass: "tm.display.CanvasElement",

    init: function(runner) {
        this.superInit();
        this.fromJSON({
            children: {
                body: {
                    type: "tm.display.CircleShape",
                    init: [10, 10, {
                        fillStyle: "hsl(0, 80%, 80%)",
                        strokeStyle: "hsl(0, 80%, 50%)",
                        lineWidth: 2
                    }]
                }
            }
        });

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
    config = (config || {}).$safe(bulletml.runner.DEFAULT_CONFIG);

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
        var copied = this._listeners["enterframe"].clone();
        for (var i = 0; i < copied.length; i++) {
            if (copied[i].isDanmaku) {
                this.off("enterframe", copied[i]);
            }
        }
    }
};

})();
