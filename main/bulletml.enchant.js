/*
 * bullet.enchant.js v0.1.0
 * @author daishi@dev7.jp
 * @require enchant.js v0.5.1 or later, bullet.js v0.1.0.
 * @description
 * enchant.js extension plugin for use BulletML.
 * 
 * The MIT License (MIT)
 * Copyright (c) 2012 dev7.jp
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

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

	enchant.Node.prototype.setAttackPattern = function(attackPattern) {
		this.attackPattern = attackPattern;
		this.attackPattern.attacker = this;
		this._attackTick = function() {
			if (this.attackPattern) {
				this.attackPattern.tick();
			}
		};
		this.addEventListener("enterframe", this._attackTick);
	};
	enchant.Node.prototype.removeAttackPattern = function() {
		this.attackPattern.attacker = null;
		this.attackPattern = null;
		this.removeEventListener("enterframe", this._attackTick);
	};

	/**
	 * @namespace
	 */
	enchant.bulletml = {};

	/**
	 * 攻撃パターン.
	 * 
	 * 単一の敵機に対応する.
	 * 
	 * @constructor
	 * @scope enchant.bulletml.AttackPattern.prototype
	 * @example
	 * 
	 * <pre>
	 * game.preload(&quot;boss.xml&quot;);
	 * ...
	 * var player = new Sprite(...); // 自機
	 * var boss = new Sprite(...); // 敵機
	 * var bossPattern = new AttackPattern(game.assets[&quot;boss.xml&quot;], {
	 *     target : player,
	 *     onenterframe: function() {
	 *         hitTest(this, player);
	 *     }
	 * });
	 * boss.setAttackPattern(bossPattern); // パターンを敵機に設定する
	 * </pre>
	 */
	enchant.bulletml.AttackPattern = enchant.Class.create({
		/**
		 * 攻撃パターンのコンストラクタ.
		 * 
		 * 第2引数configで発射される弾に関する設定を行う. <br>
		 * <table border=1>
		 * <tr>
		 * <th>プロパティ名</th>
		 * <th>型.<br>
		 * 設定内容</th>
		 * <th>デフォルト値</th>
		 * <th>必須</th>
		 * </tr>
		 * <tr>
		 * <td>target</td>
		 * <td>enchant.Node.<br>
		 * 攻撃の標的となるオブジェクト.</td>
		 * <td>null</td>
		 * <td>○</td>
		 * </tr>
		 * <tr>
		 * <td>widtd</td>
		 * <td>Number.<br>
		 * 弾スプライトの幅.Bulletのコンストラクタ引数に使用される.</td>
		 * <td>8</td>
		 * <td></td>
		 * </tr>
		 * <tr>
		 * <td>height</td>
		 * <td>Number.<br>
		 * 弾スプライトの高さ.Bulletのコンストラクタ引数に使用される.</td>
		 * <td>8</td>
		 * <td></td>
		 * </tr>
		 * <tr>
		 * <td>image</td>
		 * <td>enchant.Surface.<br>
		 * 弾スプライトの画像</td>
		 * <td>赤い球状の画像</td>
		 * <td></td>
		 * </tr>
		 * <tr>
		 * <td>frame</td>
		 * <td>Number<br>
		 * 弾スプライトのフレーム番号</td>
		 * <td>0</td>
		 * <td></td>
		 * </tr>
		 * <tr>
		 * <td>removeOnScreenOut</td>
		 * <td>Boolean<br>
		 * 弾が画面外に出た時に消去するかどうか</td>
		 * <td>true</td>
		 * <td></td>
		 * </tr>
		 * <tr>
		 * <td>bulletParent</td>
		 * <td>enchant.Group<br>
		 * <td></td>
		 * <td></td>
		 * </tr>
		 * <tr>
		 * <td>onfire</td>
		 * <td>Function.<br>
		 * 弾が発射される時に呼び出される</td>
		 * <td></td>
		 * <td></td>
		 * </tr>
		 * <tr>
		 * <td>onenterframe</td>
		 * <td>Function.<br>
		 * 毎フレーム開始時に呼び出される</td>
		 * <td></td>
		 * <td></td>
		 * </tr>
		 * <tr>
		 * <td>onremove</td>
		 * <td>Function.<br>
		 * 弾が消去される直前に呼び出される<br>
		 * vanishコマンド実行時, removeOnScreenOutがtrueの場合に画面外に出た時</td>
		 * <td></td>
		 * <td></td>
		 * </tr>
		 * </table>
		 * 
		 * @param {BulletML.Root}
		 *            [bulletml] BulletMLデータ
		 * @param {Object}
		 *            [config] 発射される弾に関する設定
		 * @param {string}
		 *            topActionLabel 最初に読み込むactionのラベル.デフォルトは"top"
		 * @constructs
		 */
		initialize : function(bulletml, config, topActionLabel) {
			this.bulletml = bulletml;
			this.topLabel = topActionLabel || "top";
			this.seq = bulletml.sequence(this.topLabel);
			this.config = {
				width : 8,
				height : 8,
				image : enchant.Surface.load(enchant.bulletml.defaultImage),
				frame : 0,
				removeOnScreenOut : true,
				target : null,
				bulletParent : null,
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
		/**
		 * 攻撃を行う敵機.
		 * 
		 * @type {enchant.Node}
		 */
		attacker : {
			get : function() {
				return this._attacker;
			},
			set : function(attacker) {
				this._attacker = attacker;
			}
		},
		/**
		 * フレームごとに呼び出される.
		 */
		tick : function() {
			if (this.age++ < this.waitTo || this.completed) {
				return;
			}

			for ( var end = this.seq.length; this.cursor < end; this.cursor++) {
				var command = this.seq[this.cursor];
				switch (command.commandName) {
				case "fire":
					enchant.bulletml.fireBullet.call(this, command,
							this.config, this._attacker);
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
		/**
		 * 攻撃パターンを最初からやりなおす.
		 */
		restart : function() {
			this.cursor = 0;
			this.waitTo = -1;
			this.completed = false;
			this.seq = this.bulletml.sequence(this.topLabel);
		},
		/**
		 * パターンを複製する.
		 * 
		 * @return {enchant.bulletml.AttackPattern}
		 */
		clone : function() {
			return new enchant.bulletml.AttackPattern(this.bulletml,
					this.config, this.topLabel);
		}
	});

	/**
	 * 弾を発射する.
	 * 
	 * @param {BulletML.Fire}
	 *            fireCmd 発射コマンド
	 * @param {Object}
	 *            config 設定
	 * @param {enchant.Node}
	 *            attacker 弾を発射するオブジェクト
	 */
	enchant.bulletml.fireBullet = function(fireCmd, config, attacker) {
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

		var parentNode = config.bulletParent || attacker.parentNode;
		if (parentNode) {
			parentNode.addChild(b);
		}

		// console.log(b.direction);

		pattern.config.onfire.call(b);
		return b;
	};

	/**
	 * 弾クラス.
	 * 
	 * @constructor
	 * @scope enchant.bulletml.Bullet.prototype
	 * @extends {enchant.Sprite}
	 */
	enchant.bulletml.Bullet = enchant.Class.create(enchant.Sprite, {
		/**
		 * @param {number}
		 *            x 初期位置x
		 * @param {number}
		 *            y 初期位置y
		 * @param {number}
		 *            width スプライトの幅
		 * @param {number}
		 *            height スプライトの高さ
		 * @param {enchant.bulletml.AttackPattern}
		 *            attackPattern 攻撃パターン
		 * @param {BulletML.Bullet}
		 *            bulletSpec 弾
		 * @constructs
		 */
		initialize : function(x, y, width, height, attackPattern, bulletSpec) {
			enchant.Sprite.call(this, width, height);
			this.x = x;
			this.y = y;
			this.pattern = attackPattern;
			this.cursor = 0;
			this.waitTo = -1;
			this.lastDirection = 0;
			this.lastSpeed = 1;

			this.direction = 0;
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

			this.speed = 1;
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

			this.speedH = 0;
			this.speedV = 0;

			this._changeDirection = null;
			this._changeSpeed = null;
			this._accel = null;

			this.scw = enchant.Game.instance.width;
			this.sch = enchant.Game.instance.height;

			this.addEventListener("enterframe", this.tick);
		},
		/**
		 * フレームごとに呼び出される.
		 */
		tick : function() {
			this.pattern.config.onenterframe.call(this);

			this._changeDirection && this._changeDirection();
			this._changeSpeed && this._changeSpeed();
			this._accel && this._accel();

			this.x += Math.cos(this.direction) * this.speed * 2
			this.y += Math.sin(this.direction) * this.speed * 2;

			this.x += this.speedH * 2;
			this.y += this.speedV * 2;

			// if (this.rotation != undefined) {
			// this.rotation = this.direction;
			// }

			if (this.pattern.config.removeOnScreenOut) {
				if (this.x < -this.width || this.scw < this.x
						|| this.y < -this.height || this.sch < this.y) {
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
					enchant.bulletml.fireBullet.call(this, command,
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
					this.accel(command);
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
		/**
		 * @param {BulletML.ChangeDirection}
		 *            cmd
		 */
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
		/**
		 * @param {BulletML.ChangeSpeed}
		 *            cmd
		 */
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
			};
		},
		/**
		 * @param {BulletML.Accel}
		 *            cmd
		 */
		accel : function(cmd) {
			var t = eval(cmd.term);
			var endAge = this.age + t;

			var incrH;
			var finalValH;
			if (cmd.horizontal) {
				var h = eval(cmd.horizontal.value);
				switch (cmd.horizontal.type) {
				case "absolute":
				case "sequence":
					incrH = (h - this.speedH) / t;
					finalValH = h;
					break;
				case "relative":
					incrH = h;
					finalValH = (h - this.speedH) * t;
					break;
				}
			} else {
				incrH = 0;
				finalValH = this.speedH;
			}

			var incrV;
			var finalValV;
			if (cmd.vertical) {
				var v = eval(cmd.vertical.value);
				switch (cmd.vertical.type) {
				case "absolute":
				case "sequence":
					incrV = (v - this.speedV) / t;
					finalValV = v;
					break;
				case "relative":
					incrV = v;
					finalValV = (v - this.speedV) * t;
					break;
				}
			} else {
				incrV = 0;
				finalValV = this.speedV;
			}

			this._accel = function() {
				this.speedH += incrH;
				this.speedV += incrV;
				if (this.age == endAge) {
					this.speedH = finalValH;
					this.speedV = finalValV;
					this._accel = null;
				}
			};
		}
	});

	/**
	 * 弾の画像が指定されなかった場合に使用される.
	 * 
	 * 8px x 8px.赤い球状の弾.
	 * 
	 * @memberOf enchant.bulletml
	 */
	enchant.bulletml.defaultImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAa0lEQVQYV2NkgIL/DAw2QGYolLuakYHhCIgNpBkYgJITGWxs8hj8/CDymzYBpY9MAkrmM4J12tgcZlizhoFBXByi4OVLBoaQEJAiW5CCiQxdXXkMpaUw2yB0dzcDQ1nZJKIU4LeCoCMJeRMAewIxn7cIaLcAAAAASUVORK5CYII=";

	/**
	 * ラジアン→度
	 */
	function toDegree(radian) {
		return radian * 180 / Math.PI;
	}
	/**
	 * 度→ラジアン
	 */
	function toRadian(degree) {
		return degree * Math.PI / 180;
	}
	/**
	 * ラジアンを -π<= rad < π の範囲に正規化する.
	 */
	function rel(radian) {
		while (radian <= -Math.PI) {
			radian += Math.PI * 2;
		}
		while (Math.PI < radian) {
			radian -= Math.PI * 2;
		}
		return radian;
	}
	/**
	 * スプライトAから見たスプライトBの方向をラジアンで返す.
	 * 
	 * @param {enchant.Node}
	 *            a スプライトA
	 * @param {enchant.Node}
	 *            b スプライトB
	 */
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
