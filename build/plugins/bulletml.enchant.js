/**
 * @namespace
 */
enchant.bulletml = enchant.bulletml || {};

(function() {

enchant.bulletml.Bullet = enchant.Class.create(enchant.Sprite, {
    initialize: function(runner) {
        enchant.Sprite.call(this, 10, 10);

        var texture = new enchant.Surface(10, 10);
        var context = texture.context;
        context.fillStyle = "hsl(0, 80%, 80%)";
        context.strokeStyle = "hsl(0, 80%, 50%)";
        context.lineWidth = 2;
        context.arc(5, 5, 4, 0, Math.PI * 2, false);
        context.fill();
        context.stroke();

        this.image = texture;

        this.runner = runner;

        this.moveTo(this.runner.x - this.width * 0.5, this.runner.y - this.height * 0.5);
        this.runner.onVanish = function() {
            if (this.parentNode) this.parentNode.removeChild(this);
        }.bind(this);
    },

    onenterframe: function() {
        this.runner.update();
        this.moveTo(this.runner.x - this.width * 0.5, this.runner.y - this.height * 0.5);
    }
});

enchant.Entity.prototype.startDanmaku = function(root, config) {
    config = (config || {});
    var defConf = bulletml.runner.DEFAULT_CONFIG;
    for (var key in defConf) if (defConf.hasOwnProperty(key)) {
        if (config[key] === undefined) config[key] = defConf[key];
    }

    var runner = root.createRunner(config);
    runner.x = this.x + this.width * 0.5;
    runner.y = this.y + this.height * 0.5;
    var enterframeListener = function() {
        runner.x = this.x + this.width * 0.5;
        runner.y = this.y + this.height * 0.5;
        runner.update();
        this.moveTo(runner.x - this.width * 0.5, runner.y - this.height * 0.5);
    };
    enterframeListener.isDanmaku = true;
    this.on("enterframe", enterframeListener);
};

enchant.Entity.prototype.stopDanmaku = function() {
    if (this._listeners["enterframe"]) {
        var copied = this._listeners["enterframe"].slice();
        for (var i = 0; i < copied.length; i++) {
            if (copied[i].isDanmaku) {
                this.removeEventListener("enterframe", copied[i]);
            }
        }
    }
};

})();
