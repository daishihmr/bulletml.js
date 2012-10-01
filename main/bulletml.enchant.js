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
	clone : function() {
		var c = new enchant.bulletml.AttackPattern(this.bulletml);
		return c;
	},
	tick : function(sprite) {
		var commands = this.bulletml.nextCommands();
	}
});

enchant.bulletml.Sprite = enchant.Class.create(enchant.Sprite, {
	initialize : function(width, height) {
		enchant.Sprite.call(this, width, height);
		this._attackPattern = null;
		this.addEventListener("enterframe", function() {
			if (this._attackPattern) {
				this._attackPattern.tick(this);
			}
		});
	},
	attackPattern : {
		get : function() {
			return this._attackPattern;
		},
		set : function(attackPattern) {
			this._attackPattern = attackPattern.clone();
		}
	}
});
