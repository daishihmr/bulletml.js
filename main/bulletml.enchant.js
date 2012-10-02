"use strict";

(function() {

	// BulletML(*.bml)をpreloadで読み込めるようにする.
	enchant.Game._loadFuncs["bml"] = function(src, callback) {
		var game = this;
		var req = new XMLHttpRequest();
		req.open('GET', src, true);
		req.onreadystatechange = function(e) {
			if (req.readyState === 4) {
				if (req.status !== 200 && req.status !== 0) {
					throw new Error(req.status + ': '
							+ 'Cannot load an asset: ' + src);
				}

				game.assets[src] = BulletML.build(req.responseXML);
				callback();
			}
		};
		req.send(null);
	};

	enchant.Node.prototype.setAttackPattern = function(bml, config) {
		this.attackPattern = new enchant.bulletml.AttackPattern(bml, config);
		this.attackPattern.attacker = this;
	};
	enchant.Node.prototype.removeAttackPattern = function() {
		this.attackPattern.attacker = null;
		this.attackPattern = null;
	};

	enchant.bulletml = {};
	enchant.bulletml.AttackPattern = enchant.Class.create({
		initialize : function(bulletml, config) {
			this.bulletml = bulletml;
			this.seq = bulletml.sequence();

			this.config = {
				width : 8,
				height : 8,
				image : enchant.Surface.load(enchant.bulletml.defaultImage),
				frame : 0,
				removeOnScreenOut : true,
				target : null,
				onfire : function() {
				}
			};
			if (config) {
				for ( var prop in config) {
					if (config.hasOwnProperty(prop)) {
						this.config[prop] = config[prop];
					}
				}
			}

			this.age = 0;
			this.cursor = 0;
			this.waitTo = -1;
			this.direction = 90;
			this._attacker = null;
		},
		attacker : {
			get : function() {
				return this._attacker;
			},
			set : function(attacker) {
				this._attacker = attacker;
				attacker.addEventListener("enterframe", function() {
					if (this.attackPattern) {
						this.attackPattern.tick();
					}
				});
			}
		},
		tick : function() {
			if (this.age++ < this.waitTo) {
				return;
			}

			for ( var end = this.seq.length; this.cursor < end; this.cursor++) {
				var command = this.seq[this.cursor];
				switch (command.commandName) {
				case "fire":
					this.fire(command, this.attacker.scene);
					break;
				case "wait":
					this.waitTo = this.age + eval(command.value);
					this.cursor++;
					return;
				case "loopEnd":
					if (command.loopCount == -1
							|| command.loopCount == undefined) {
						command.loopCount = 0;
					} else {
						command.loopCount += 1;
					}
					if (command.loopCount < command.times - 1) {
						while (0 < this.cursor
								&& this.seq[this.cursor] != command.start) {
							this.cursor -= 1;
						}
					} else {
						command.loopCount = -1;
					}
				}
			}
		},
		fire : function(fireCmd, scene) {
			var b = new enchant.bulletml.Bullet(this.config.width,
					this.config.height, this);
			b.image = this.config.image;
			b.frame = this.config.frame;
			b.x = this.attacker.x + (this.attacker.width - b.width) / 2;
			b.y = this.attacker.y + (this.attacker.height - b.height) / 2;

			var dv = toRadian(eval(fireCmd.direction.value));
			if (fireCmd.direction.type == "aim") {

			}
			b.speed = eval(fireCmd.speed.value);

			b.seq = fireCmd.bullet.sequence();

			if (scene) {
				scene.addChild(b);
			}
			return b;
		}
	});

	enchant.bulletml.Bullet = enchant.Class.create(enchant.Sprite, {
		initialize : function(width, height, attackPattern) {
			enchant.Sprite.call(this, width, height);
			this.parent = attackPattern;
			this.cursor = 0;
			this.waitTo = -1;
			this.addEventListener("enterframe", this.tick);

			this.direction = toRadian(90);
			this.speed = 1;
			this.accelH = 0;
			this.accelV = 0;

			this.scw = enchant.Game.instance.width;
			this.sch = enchant.Game.instance.height;
		},
		tick : function() {
			this.x += Math.cos(this.direction) * this.speed;
			this.y += Math.sin(this.direction) * this.speed;

			if (this.parent.config.removeOnScreenOut) {
				if (this.x < 0 || this.scw + this.width < this.x || this.y < 0
						|| this.sch + this.height < this.y) {
					this.parentNode.removeChild(this);
					console.log("remove");
				}
			}
		}
	});

	enchant.bulletml.defaultImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAa0lEQVQYV2NkgIL/DAw2QGYolLuakYHhCIgNpBkYgJITGWxs8hj8/CDymzYBpY9MAkrmM4J12tgcZlizhoFBXByi4OVLBoaQEJAiW5CCiQxdXXkMpaUw2yB0dzcDQ1nZJKIU4LeCoCMJeRMAewIxn7cIaLcAAAAASUVORK5CYII=";

	function toDegree(radian) {
		return radian * 180 / Math.PI;
	}
	function toRadian(degree) {
		return degree * Math.PI / 180;
	}

})();
