/**
 * @namespace
 */
enchant.bulletml = enchant.bulletml || {};

(function() {

bulletml.runner.DEFAULT_CONFIG.createNewBullet = function(runner, spec) {
    var scene = enchant.Core.instance.currentScene;
    console.log(scene);
};

enchant.Entity.prototype.startDanmaku = function(root, config) {
};

})();
