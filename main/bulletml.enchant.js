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
    enchant.Game._loadFuncs["bml"] = enchant.Game._loadFuncs["xml"] = function(
            src, callback) {
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
    enchant.bulletml.AttackPattern = enchant.Class
            .create({
                /**
                 * 攻撃パターンのコンストラクタ.
                 * 
                 * 
                 * @param {BulletML.Root}
                 *            [bulletml] BulletMLデータ
                 * @constructs
                 */
                initialize : function(bulletml) {
                    this._bulletml = bulletml;
                },
                _getConf : function(base) {
                    var config = {
                        bulletFactory : function(spec) {
                            var bullet = new enchant.Sprite(8, 8);
                            bullet.image = enchant.Surface
                                    .load(enchant.bulletml.DEFAULT_IMAGE);
                            return bullet;
                        },
                        testOnScreen : function(bullet) {
                            var scw = enchant.Game.instance.width;
                            var sch = enchant.Game.instance.height;
                            var w = bullet.width || 0;
                            var h = bullet.height || 0;
                            return (-w <= bullet.x && bullet.x < scw
                                    && -h <= bullet.y && bullet.y < sch);
                        },
                        rank : 0
                    };
                    if (base !== undefined) {
                        for ( var prop in base) {
                            if (base.hasOwnProperty(prop)) {
                                config[prop] = base[prop];
                            }
                        }
                    }
                    return config;
                },
                /**
                 * enterframeイベントのリスナを作成する.
                 * 
                 * 第2引数config各種設定を行う. <br>
                 * 
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
                 * <td>addTarget</td>
                 * <td>enchant.Group<br>
                 * <td>攻撃を実行するノードの親ノード</td>
                 * <td></td>
                 * </tr>
                 * <tr>
                 * <td>bulletFactory</td>
                 * <td>function<br>
                 * <td>小さな赤い弾を生成する</td>
                 * <td></td>
                 * </tr>
                 * </table>
                 * 
                 * @param {string}
                 *            topActionLabel 最初に読み込むactionのラベル.デフォルトは"top"
                 * @param {Object}
                 *            [config] 発射される弾に関する設定
                 */
                createTicker : function(config, action) {
                    config = this._getConf(config);

                    var seq;
                    if (action === undefined) {
                        seq = this._bulletml.sequence("top", config.rank);
                    } else if (typeof (topActionLabel) === "string") {
                        seq = this._bulletml.sequence(action, config.rank);
                    } else if (action instanceof BulletML.Bullet) {
                        seq = action.sequence();
                    } else {
                        throw new Error("引数が不正", action);
                    }

                    var pattern = this;
                    var onEnterframeListener = function() {
                        var t = onEnterframeListener;

                        t._changeDirection && t._changeDirection.call(this);
                        t._changeSpeed && t._changeSpeed.call(this);
                        t._accel && t._accel.call(this);

                        this.x += Math.cos(t.direction) * t.speed * 2
                        this.y += Math.sin(t.direction) * t.speed * 2;
                        this.x += t.speedH * 2;
                        this.y += t.speedV * 2;

                        if (!config.testOnScreen(this)) {
                            this.parentNode.removeChild(this);
                        }

                        if (this.age < t.waitTo || t.completed) {
                            return;
                        }
                        for ( var end = seq.length; t.cursor < end; t.cursor++) {
                            var cmd = seq[t.cursor];
                            switch (cmd.commandName) {
                            case "fire":
                                pattern.fire.call(this, cmd, config, this,
                                        pattern);
                                break;
                            case "wait":
                                t.waitTo = this.age + eval(cmd.value);
                                t.cursor += 1;
                                return;
                            case "loopEnd":
                                cmd.loopCount = (cmd.loopCount == -1) ? 0
                                        : (cmd.loopCount + 1);
                                if (cmd.loopCount < cmd.times - 1) {
                                    while (0 < t.cursor
                                            && seq[t.cursor] != cmd.start) {
                                        t.cursor -= 1;
                                    }
                                } else {
                                    cmd.loopCount = -1;
                                }
                                break;
                            case "changeDirection":
                                pattern.changeDirection.call(this, cmd, config,
                                        t);
                                break;
                            case "changeSpeed":
                                pattern.changeSpeed.call(this, cmd, t);
                                break;
                            case "accel":
                                pattern.accel.call(this, cmd, t);
                                break;
                            case "vanish":
                                if (this.parentNode) {
                                    this.parentNode.removeChild(this);
                                }
                                t.cursor = end;
                                break;
                            }
                        }

                        t.completed = true;
                        this.dispatchEvent(new Event("completeAttack"));
                    };

                    onEnterframeListener.restart = function() {
                        this.cursor = 0;
                        this.waitTo = -1;
                        this.completed = false;

                        this.direction = 0;
                        this.lastDirection = 0;
                        this.speed = 0;
                        this.lastSpeed = 0;
                        this.speedH = 0;
                        this.speedV = 0;

                        this._changeDirection = null;
                        this._changeSpeed = null;
                        this._accel = null;
                    };
                    onEnterframeListener.restart();

                    return onEnterframeListener;
                },
                /**
                 * 弾を発射する.
                 * 
                 * @param {BulletML.Fire}
                 *            cmd 発射コマンド
                 * @param {Object}
                 *            config 設定
                 * @param {enchant.Node}
                 *            attacker 弾を発射するオブジェクト
                 */
                fire : function(cmd, config, ticker, pattern) {
                    var b = config.bulletFactory({
                        label : cmd.bullet.label
                    });
                    b.x = this.x + ((this.width || 0) - (b.width || 0)) / 2;
                    b.y = this.y + ((this.height || 0) - (b.height || 0)) / 2;

                    var bt = pattern.createTicker(config, cmd.bullet);

                    var attacker = this;
                    var calcDirection = function(d) {
                        var dv = toRadian(eval(d.value));
                        switch (d.type) {
                        case "aim":
                            if (config.target) {
                                return radiusAtoB(attacker, config.target) + dv;
                            } else {
                                return dv - Math.PI / 2;
                            }
                        case "absolute":
                            return dv - Math.PI / 2; // 真上が0度
                        case "relative":
                            return ticker.direction + dv;
                        case "sequence":
                            return ticker.lastDirection + dv;
                        }
                    };
                    bt.direction = calcDirection(cmd.direction
                            || cmd.bullet.direction);
                    ticker.lastDirection = bt.direction;

                    var calcSpeed = function(s) {
                        var sv = eval(s.value);
                        switch (s.type) {
                        case "relative":
                        case "sequence":
                            return ticker.lastSpeed + sv;
                        case "absolute":
                        default:
                            return sv;
                        }
                    };
                    bt.speed = calcSpeed(cmd.speed || cmd.bullet.speed);
                    ticker.lastSpeed = bt.speed;

                    b.addEventListener("enterframe", bt);
                    if (config.addTarget) {
                        config.addTarget.addChild(b);
                    } else if (this.parentNode) {
                        this.parentNode.addChild(b);
                    }
                },
                /**
                 * @param {BulletML.ChangeDirection}
                 *            cmd
                 */
                changeDirection : function(cmd, config, ticker) {
                    var incr;
                    var finalVal;
                    var endAge;

                    var d = eval(cmd.direction.value);
                    var t = eval(cmd.term);
                    switch (cmd.direction.type) {
                    case "aim":
                        var tar = config.target;
                        if (!tar) {
                            return;
                        }
                        finalVal = radiusAtoB(this, tar) + toRadian(d);
                        incr = rel(finalVal - ticker.direction) / t;
                        break;
                    case "absolute":
                        finalVal = toRadian(d) - Math.PI / 2;
                        incr = rel(finalVal - ticker.direction) / t;
                        break;
                    case "relative":
                        finalVal = ticker.direction + toRadian(d);
                        incr = rel(finalVal - ticker.direction) / t;
                        break;
                    case "sequence":
                        incr = toRadian(d);
                        finalVal = ticker.direction + incr * t;
                        break;
                    }
                    endAge = this.age + t;

                    ticker._changeDirection = function() {
                        ticker.direction += incr;
                        if (this.age == endAge) {
                            ticker.direction = finalVal;
                            ticker._changeDirection = null;
                        }
                    };
                },
                /**
                 * @param {BulletML.ChangeSpeed}
                 *            cmd
                 */
                changeSpeed : function(cmd, ticker) {
                    var incr;
                    var finalVal;
                    var endAge;

                    var s = eval(cmd.speed.value);
                    var t = eval(cmd.term);
                    switch (cmd.speed.type) {
                    case "absolute":
                        finalVal = s;
                        incr = (finalVal - ticker.speed) / t;
                        break;
                    case "relative":
                        finalVal = s + ticker.speed;
                        incr = (finalVal - ticker.speed) / t;
                        break;
                    case "sequence":
                        incr = s;
                        finalVal = ticker.speed + incr * t;
                        break;
                    }
                    endAge = this.age + t;

                    ticker._changeSpeed = function() {
                        ticker.speed += incr;
                        if (this.age == endAge) {
                            ticker.speed = finalVal;
                            ticker._changeSpeed = null;
                        }
                    };
                },
                /**
                 * @param {BulletML.Accel}
                 *            cmd
                 */
                accel : function(cmd, ticker) {
                    var t = eval(cmd.term);
                    var endAge = this.age + t;

                    var incrH;
                    var finalValH;
                    if (cmd.horizontal) {
                        var h = eval(cmd.horizontal.value);
                        switch (cmd.horizontal.type) {
                        case "absolute":
                        case "sequence":
                            incrH = (h - ticker.speedH) / t;
                            finalValH = h;
                            break;
                        case "relative":
                            incrH = h;
                            finalValH = (h - ticker.speedH) * t;
                            break;
                        }
                    } else {
                        incrH = 0;
                        finalValH = ticker.speedH;
                    }

                    var incrV;
                    var finalValV;
                    if (cmd.vertical) {
                        var v = eval(cmd.vertical.value);
                        switch (cmd.vertical.type) {
                        case "absolute":
                        case "sequence":
                            incrV = (v - ticker.speedV) / t;
                            finalValV = v;
                            break;
                        case "relative":
                            incrV = v;
                            finalValV = (v - ticker.speedV) * t;
                            break;
                        }
                    } else {
                        incrV = 0;
                        finalValV = ticker.speedV;
                    }

                    ticker._accel = function() {
                        ticker.speedH += incrH;
                        ticker.speedV += incrV;
                        if (this.age == endAge) {
                            ticker.speedH = finalValH;
                            ticker.speedV = finalValV;
                            ticker._accel = null;
                        }
                    };
                },
                bulletml : {
                    get : function() {
                        return this._bulletml;
                    }
                }
            });

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
        }
    });

    /**
     * 弾の画像が指定されなかった場合に使用される.
     * 
     * 8px x 8px.赤い球状の弾.
     * 
     * @memberOf enchant.bulletml
     */
    enchant.bulletml.DEFAULT_IMAGE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAa0lEQVQYV2NkgIL/DAw2QGYolLuakYHhCIgNpBkYgJITGWxs8hj8/CDymzYBpY9MAkrmM4J12tgcZlizhoFBXByi4OVLBoaQEJAiW5CCiQxdXXkMpaUw2yB0dzcDQ1nZJKIU4LeCoCMJeRMAewIxn7cIaLcAAAAASUVORK5CYII=";

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
