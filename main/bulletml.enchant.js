"use strict";

(function() {

	// BulletML(*.bml)をpreloadで読み込めるようにする.
	enchant.Game._loadFuncs["bml"] = function(src, callback) {
		var game = this;
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function(e) {
			if (xhr.readyState === 4) {
				if (xhr.status !== 200 && xhr.status !== 0) {
					throw new Error(xhr.status + ': '
							+ 'Cannot load an asset: ' + src);
				}

				if (xhr.responseXML != null) {
					game.assets[src] = BulletML.build(xhr.responseXML);
					callback();
				} else if (xhr.responseText != null) {
					game.assets[src] = BulletML.build(xhr.responseText);
					callback();
				} else {
					throw new Error(xhr.status + ': '
							+ 'Cannot load an asset: ' + src);
				}
			}
		};

		xhr.open('GET', src, true);
		if (xhr.overrideMimeType) {
			xhr.overrideMimeType("application/xml");
		}
		xhr.send(null);
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
			this.direction = 0;
			this.speed = 1;
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
					console.log(command.direction.value);
					this.fire(command, this._attacker.scene);
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
					this.config.height, this, fireCmd.bullet);
			b.image = this.config.image;
			b.frame = this.config.frame;
			b.x = this._attacker.x + (this._attacker.width - b.width) / 2;
			b.y = this._attacker.y + (this._attacker.height - b.height) / 2;

			if (fireCmd.direction) {
				var dv = toRadian(eval(fireCmd.direction.value));
				switch (fireCmd.direction.type) {
				case "absolute":
					b.direction = dv - Math.PI / 2; // 真上が0度
					break;
				case "sequence":
					b.direction = this.direction + dv;
					break;
				case "aim":
				default:
					if (this.config.target) {
						var t = this.config.target;
						var a = this._attacker;
						b.direction = Math.atan2(t.y - a.y, t.x - a.x) + dv;
					} else {
						b.direction = dv;
					}
					break;
				}
			}
			this.direction = b.direction;

			if (fireCmd.speed) {
				var sv = eval(fireCmd.speed.value);
				switch (fireCmd.speed.type) {
				case "relative":
				case "sequence":
					b.speed = this.speed + sv;
					break;
				case "absolute":
				default:
					b.speed = sv;
					break;
				}
			}
			this.speed = b.speed;

			b.seq = fireCmd.bullet.sequence();

			if (scene) {
				scene.addChild(b);
			}
			return b;
		}
	});

	enchant.bulletml.Bullet = enchant.Class.create(enchant.Sprite, {
		initialize : function(width, height, attackPattern, bulletSpec) {
			enchant.Sprite.call(this, width, height);
			this.parent = attackPattern;
			this.cursor = 0;
			this.waitTo = -1;
			this.addEventListener("enterframe", this.tick);

			this.direction = 0;
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
