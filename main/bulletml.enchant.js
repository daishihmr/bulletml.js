"use strict";

// BulletML(*.bml)をpreloadで読み込めるようにする.
enchant.Game._loadFuncs["bml"] = function(src, callback) {
	var game = this;
	var req = new XMLHttpRequest();
	req.open('GET', src, true);
	req.onreadystatechange = function(e) {
		if (req.readyState === 4) {
			if (req.status !== 200 && req.status !== 0) {
				throw new Error(req.status + ': ' + 'Cannot load an asset: '
						+ src);
			}

			game.assets[src] = new enchant.bulletml.AttackPattern(BulletML
					.build(req.responseXML));
			callback();
		}
	};
	req.send(null);
};

enchant.bulletml = {};

enchant.bulletml.AttackPattern = enchant.Class.create({
	initialize : function(bulletml) {
		this.bulletml = bulletml;
	},
	tick : function(sprite, callback) {
	}
});
