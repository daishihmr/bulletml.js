"use strict";

(function() {

	// BulletML(*.xml)をpreloadで読み込めるようにする.
	enchant.Game._loadFuncs["xml"] = function(src, callback) {
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

	/**
	 * namespace.
	 */
	enchant.bulletml = {};

	/**
	 * 攻撃パターン.
	 */
	enchant.bulletml.AttackPattern = enchant.Class.create({
		initialize : function(bulletml, config) {
			this.bulletml = bulletml;
			this.seq = bulletml.sequence();
			console.log(this.seq);

			this.config = {
				width : 8,
				height : 8,
				image : enchant.Surface.load(enchant.bulletml.defaultImage),
				frame : 0,
				removeOnScreenOut : true,
				target : null,
				onfire : function() {
				},
				onenterframe : function() {
				},
				onremove : function() {
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
			this.lastDirection = 0;
			this.lastSpeed = 1;
			this._attacker = null;
			this.completed = false;
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
			if (this.age++ < this.waitTo || this.completed) {
				return;
			}

			for ( var end = this.seq.length; this.cursor < end; this.cursor++) {
				var command = this.seq[this.cursor];
				switch (command.commandName) {
				case "fire":
					enchant.bulletml.fireBullet.call(this, command,
							this._attacker.scene, this.config, this._attacker);
					break;
				case "wait":
					this.waitTo = this.age + eval(command.value);
					this.cursor += 1;
					return;
				case "loopEnd":
					if (command.loopCount == -1) {
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
					break;
				}
			}
			this._attacker.dispatchEvent(new Event("completeAttack"));
			this.completed = true;
		},
		restart : function() {
			this.cursor = 0;
			this.waitTo = -1;
			this.completed = false;
			this.seq = this.bulletml.sequence();
		}
	});

	/**
	 * 弾を発射.
	 */
	enchant.bulletml.fireBullet = function(fireCmd, scene, config, attacker) {
		// console.log(fireCmd.direction.type, fireCmd.direction.value);
		var pattern;
		if (this instanceof enchant.bulletml.AttackPattern) {
			pattern = this;
		} else if (this.pattern) {
			pattern = this.pattern;
		}

		var w = config.width;
		var h = config.height;
		var x = attacker.x + ((attacker.width || 0) - w) / 2;
		var y = attacker.y + ((attacker.height || 0) - h) / 2;
		var b = new enchant.bulletml.Bullet(x, y, w, h, pattern, fireCmd.bullet);

		b.image = config.image;
		b.frame = config.frame;

		if (fireCmd.direction) {
			var dv = toRadian(eval(fireCmd.direction.value));
			switch (fireCmd.direction.type) {
			case "aim":
				if (config.target) {
					var t = config.target;
					b.direction = radiusAtoB(b, t) + dv;
				} else {
					b.direction = dv;
				}
				break;
			case "absolute":
				b.direction = dv - Math.PI / 2; // 真上が0度
				break;
			case "relative":
				if (this.direction) {
					b.direction = this.direction + dv;
				} else if (this.lastDirection) {
					b.direction = this.lastDirection + dv;
				}
				break;
			case "sequence":
				b.direction = this.lastDirection + dv;
				break;
			}
		}

		this.lastDirection = b.direction;

		if (fireCmd.speed) {
			var sv = eval(fireCmd.speed.value);
			switch (fireCmd.speed.type) {
			case "relative":
			case "sequence":
				b.speed = this.lastSpeed + sv;
				break;
			case "absolute":
			default:
				b.speed = sv;
				break;
			}
		}
		this.lastSpeed = b.speed;

		b.seq = fireCmd.bullet.sequence();

		if (scene) {
			scene.addChild(b);
		}

		// console.log(b.direction);

		pattern.config.onfire.call(b);
		return b;
	};

	/**
	 * 弾.
	 */
	enchant.bulletml.Bullet = enchant.Class.create(enchant.Sprite, {
		initialize : function(x, y, width, height, attackPattern, bulletSpec) {
			enchant.Sprite.call(this, width, height);
			this.x = x;
			this.y = y;
			this.pattern = attackPattern;
			this.cursor = 0;
			this.waitTo = -1;
			this.lastDirection = 0;
			this.lastSpeed = 1;

			if (bulletSpec.direction) {
				var dv = toRadian(eval(bulletSpec.direction.value));
				switch (bulletSpec.direction.type) {
				case "absolute":
					this.direction = dv - Math.PI / 2; // 真上が0度
					break;
				case "sequence":
					this.direction = attackPattern.lastDirection + dv;
					break;
				case "aim":
					if (attackPattern.config.target) {
						var a = attackPattern.attacker;
						var t = attackPattern.config.target;
						this.direction = radiusAtoB(a, t) + dv;
					} else {
						this.direction = dv;
					}
					break;
				}
			}

			if (bulletSpec.speed) {
				var sv = eval(bulletSpec.speed.value);
				switch (bulletSpec.speed.type) {
				case "absolute":
				case "relative":
					this.speed = sv;
					break;
				case "sequence":
					this.speed = attackPattern.lastSpeed + sv;
					break;
				}
			}
			attackPattern.lastSpeed = this.speed;

			this.accelH = 0;
			this.accelV = 0;

			this._changeDirection = null;
			this._changeSpeed = null;

			this.scw = enchant.Game.instance.width;
			this.sch = enchant.Game.instance.height;

			this.addEventListener("enterframe", this.tick);
		},
		tick : function() {
			this.pattern.config.onenterframe.call(this);

			this._changeDirection && this._changeDirection();
			this._changeSpeed && this._changeSpeed();

			this.x += Math.cos(this.direction) * this.speed * 2;
			this.y += Math.sin(this.direction) * this.speed * 2;
			if (this.rotation != undefined) {
				this.rotation = this.direction;
			}

			if (this.pattern.config.removeOnScreenOut) {
				if (this.x < 0 || this.scw + this.width < this.x || this.y < 0
						|| this.sch + this.height < this.y) {
					this.pattern.config.onremove.call(this);
					this.parentNode.removeChild(this);
				}
			}

			if (this.age < this.waitTo) {
				return;
			}

			for ( var end = this.seq.length; this.cursor < end; this.cursor++) {
				var command = this.seq[this.cursor];
				switch (command.commandName) {
				case "fire":
					enchant.bulletml.fireBullet.call(this, command, this.scene,
							this.pattern.config, this);
					break;
				case "wait":
					this.waitTo = this.age + eval(command.value);
					this.cursor += 1;
					return;
				case "loopEnd":
					if (command.loopCount == -1) {
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
					break;
				case "changeDirection":
					this.changeDirection(command);
					break;
				case "changeSpeed":
					this.changeSpeed(command);
					break;
				case "accel":
					// TODO
					break;
				case "vanish":
					this.pattern.config.onremove.call(this);
					if (this.parentNode) {
						this.parentNode.removeChild(this);
					}
					return;
				}
			}
		},
		changeDirection : function(cmd) {
			var incr;
			var finalVal;
			var endAge;

			var d = eval(cmd.direction.value);
			var t = eval(cmd.term);
			switch (cmd.direction.type) {
			case "aim":
				var tar = this.pattern.config.target;
				if (!tar) {
					return;
				}
				finalVal = radiusAtoB(this, tar) + toRadian(d);
				incr = rel(finalVal - this.direction) / t;
				break;
			case "absolute":
				finalVal = toRadian(d) - Math.PI / 2;
				incr = rel(finalVal - this.direction) / t;
				break;
			case "relative":
				finalVal = this.direction + toRadian(d);
				incr = rel(finalVal - this.direction) / t;
				break;
			case "sequence":
				incr = toRadian(d);
				finalVal = this.direction + incr * t;
				break;
			}
			endAge = this.age + t;

			this._changeDirection = function() {
				this.direction += incr;
				if (this.age == endAge) {
					this.direction = finalVal;
					this._changeDirection = null;
				}
			};
		},
		changeSpeed : function(cmd) {
			var incr;
			var finalVal;
			var endAge;

			var s = eval(cmd.speed.value);
			var t = eval(cmd.term);
			switch (cmd.speed.type) {
			case "absolute":
				finalVal = s;
				incr = (finalVal - this.speed) / t;
				break;
			case "relative":
				finalVal = s + this.speed;
				incr = (finalVal - this.speed) / t;
				break;
			case "sequence":
				incr = s;
				finalVal = this.speed + incr * t;
				break;
			}
			endAge = this.age + t;

			this._changeSpeed = function() {
				this.speed += incr;
				if (this.age == endAge) {
					this.speed = finalVal;
					this._changeSpeed = null;
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
	function rel(radian) {
		while (radian <= -Math.PI) {
			radian += Math.PI * 2;
		}
		while (Math.PI < radian) {
			radian -= Math.PI * 2;
		}
		return radian;
	}
	function radiusAtoB(a, b) {
		var ca = {
			x : a.x + (a.width || 0) / 2,
			y : a.y + (a.height || 0) / 2
		};
		var cb = {
			x : b.x + (b.width || 0) / 2,
			y : b.y + (b.height || 0) / 2
		};
		return Math.atan2(cb.y - ca.y, cb.x - ca.x);
	}

})();
