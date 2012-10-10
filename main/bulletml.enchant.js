/*
 * bullet.enchant.js v0.2.0
 * @author daishi@dev7.jp
 * @require enchant.js v0.5.1 or later, bulletml.js v0.1.0.
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
     * @scope enchant.bulletml.AttackPattern.prototype
     */
    enchant.bulletml.AttackPattern = enchant.Class
            .create({
                /**
                 * 攻撃パターン.
                 * 
                 * 単一の敵機に対応する.
                 * 
                 * @example
                 * 
                 * <pre>
                 * game.preload(&quot;boss.xml&quot;);
                 * ...
                 * var player = new Sprite(... // 自機
                 * var boss = new Sprite(... // 敵機
                 * var pattern = new AttackPattern(game.assets[&quot;boss.xml&quot;]); // 攻撃パターンを生成
                 * var ticker = pattern.createTicker(player); // 自機を標的としたenterframeイベントリスナを生成
                 * boss.addEventListener(&quot;enterframe&quot;, ticker); // パターンを敵機に設定する
                 * </pre>
                 * 
                 * @constructs
                 * @param {BulletML.Root}
                 *            bulletml BulletMLデータ
                 */
                initialize : function(bulletml) {
                    this._bulletml = bulletml;
                },
                _getConf : function(base) {
                    if (base instanceof enchant.Node) {
                        base = {
                            target : base
                        };
                    }

                    var config = {
                        bulletFactory : function(spec) {
                            var bullet = new enchant.Sprite(8, 8);
                            bullet.image = enchant.Surface
                                    .load(enchant.bulletml.DEFAULT_IMAGE);
                            return bullet;
                        },
                        testInWorld : function(bullet) {
                            var scw = enchant.Game.instance.width;
                            var sch = enchant.Game.instance.height;
                            var w = bullet.width || 0;
                            var h = bullet.height || 0;
                            return (-w <= bullet.x && bullet.x < scw
                                    && -h <= bullet.y && bullet.y < sch);
                        },
                        rank : 0,
                        updateProperties : false
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
                 * enterframeイベントのリスナを作成する.<br>
                 * <br>
                 * 第1引数configで各種設定を行う. <br>
                 * 
                 * 
                 * @param {Object|enchant.Node}
                 *            config 発射される弾に関する設定.<br>
                 *            <table border=1>
                 *            <tr>
                 *            <th>プロパティ名</th>
                 *            <th>型</th>
                 *            <th>設定内容</th>
                 *            <th>デフォルト値</th>
                 *            <th>必須</th>
                 *            </tr>
                 *            <tr>
                 *            <td>target</td>
                 *            <td>enchant.Node</td>
                 *            <td>攻撃の標的となるオブジェクト</td>
                 *            <td>null</td>
                 *            <td>○</td>
                 *            </tr>
                 *            <tr>
                 *            <td>addTarget</td>
                 *            <td>enchant.Group</td>
                 *            <td>生成した弾を追加するノード</td>
                 *            <td>攻撃を実行するノードのparentNode</td>
                 *            <td></td>
                 *            </tr>
                 *            <tr>
                 *            <td>bulletFactory</td>
                 *            <td>function</td>
                 *            <td>弾ノードを生成する関数</td>
                 *            <td>小さな赤い弾を生成</td>
                 *            <td></td>
                 *            </tr>
                 *            <tr>
                 *            <td>updateProperties</td>
                 *            <td>boolean</td>
                 *            <td>弾のプロパティ(direction, speed)を更新するかどうか</td>
                 *            <td>false</td>
                 *            <td></td>
                 *            </tr>
                 *            <tr>
                 *            <td>testInWorld</td>
                 *            <td>function</td>
                 *            <td>弾が画面内に存在することを判定する関数</td>
                 *            <td>Gameインスタンスの大きさをベースにして判定する</td>
                 *            <td></td>
                 *            </tr>
                 *            </table>
                 *            設定する項目がtargetのみの場合、標的オブジェクトを直接引数として渡すことが可能.
                 * @param {string}
                 *            [action] 最初に読み込むactionのラベル.<br>
                 *            省略可(デフォルト値は"top").
                 * @returns {function} enterframeイベントのリスナ.<br>
                 *          攻撃パターンを初めからやりなおすrestartメソッドを持つ.
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

                    var ticker = function() {
                        // change direction
                        if (this.age < ticker.chDirEnd) {
                            ticker.direction += ticker.dirIncr;
                        } else if (this.age == ticker.chDirEnd) {
                            ticker.direction = ticker.dirFin;
                        }

                        // change speed
                        if (this.age < ticker.chSpdEnd) {
                            ticker.speed += ticker.spdIncr;
                        } else if (this.age == ticker.chSpdEnd) {
                            ticker.speed = ticker.spdFin;
                        }

                        // accel
                        if (this.age < ticker.aclEnd) {
                            ticker.speedH += ticker.aclIncrH;
                            ticker.speedV += ticker.aclIncrV;
                        } else if (this.age == ticker.aclEnd) {
                            ticker.speedH = ticker.aclFinH;
                            ticker.speedV = ticker.aclFinV;
                        }

                        // move
                        this.x += Math.cos(ticker.direction) * ticker.speed * 2;
                        this.y += Math.sin(ticker.direction) * ticker.speed * 2;
                        this.x += ticker.speedH * 2;
                        this.y += ticker.speedV * 2;

                        if (!config.testInWorld(this)) {
                            this.parentNode.removeChild(this);
                        }

                        if (config.updateProperties) {
                            this.direction = ticker.direction;
                            this.speed = ticker.speed;
                        }

                        if (this.age < ticker.waitTo || ticker.completed) {
                            return;
                        }
                        for ( var end = seq.length; ticker.cursor < end; ticker.cursor++) {
                            var cmd = seq[ticker.cursor];
                            switch (cmd.commandName) {
                            case "fire":
                                pattern._fire.call(this, cmd, config, this,
                                        pattern);
                                break;
                            case "wait":
                                ticker.waitTo = this.age + eval(cmd.value);
                                ticker.cursor += 1;
                                return;
                            case "loopEnd":
                                cmd.loopCount = (cmd.loopCount == -1) ? 0
                                        : (cmd.loopCount + 1);
                                if (cmd.loopCount < cmd.times - 1) {
                                    while (0 < ticker.cursor
                                            && seq[ticker.cursor] != cmd.start) {
                                        ticker.cursor -= 1;
                                    }
                                } else {
                                    cmd.loopCount = -1;
                                }
                                break;
                            case "changeDirection":
                                pattern._changeDirection.call(this, cmd,
                                        config, ticker);
                                break;
                            case "changeSpeed":
                                pattern._changeSpeed.call(this, cmd, ticker);
                                break;
                            case "accel":
                                pattern._accel.call(this, cmd, ticker);
                                break;
                            case "vanish":
                                if (this.parentNode) {
                                    this.parentNode.removeChild(this);
                                }
                                ticker.cursor = end;
                                break;
                            }
                        }

                        ticker.completed = true;
                        this.dispatchEvent(new Event("completeAttack"));
                    };
                    ticker.restart = function() {
                        this.cursor = 0;
                        this.waitTo = -1;
                        this.completed = false;

                        this.direction = 0;
                        this.lastDirection = 0;
                        this.speed = 0;
                        this.lastSpeed = 0;
                        this.speedH = 0;
                        this.speedV = 0;

                        this.dirIncr = 0;
                        this.dirFin = 0;
                        this.chDirEnd = -1;

                        this.spdIncr = 0;
                        this.spdFin = 0;
                        this.chSpdEnd = -1;

                        this.aclIncrH = 0;
                        this.aclFinH = 0;
                        this.aclIncrV = 0;
                        this.aclFinV = 0;
                        this.aclEnd = -1;
                    };
                    ticker.restart();

                    return ticker;
                },
                _fire : function(cmd, config, ticker, pattern) {
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
                _changeDirection : function(cmd, config, ticker) {
                    var d = eval(cmd.direction.value);
                    var t = eval(cmd.term);
                    switch (cmd.direction.type) {
                    case "aim":
                        var tar = config.target;
                        if (!tar) {
                            return;
                        }
                        ticker.dirFin = radiusAtoB(this, tar) + toRadian(d);
                        ticker.dirIncr = rel(ticker.dirFin - ticker.direction)
                                / t;
                        break;
                    case "absolute":
                        ticker.dirFin = toRadian(d) - Math.PI / 2;
                        ticker.dirIncr = rel(ticker.dirFin - ticker.direction)
                                / t;
                        break;
                    case "relative":
                        ticker.dirFin = ticker.direction + toRadian(d);
                        ticker.dirIncr = rel(ticker.dirFin - ticker.direction)
                                / t;
                        break;
                    case "sequence":
                        ticker.dirIncr = toRadian(d);
                        ticker.dirFin = ticker.direction + ticker.dirIncr * t;
                        break;
                    }
                    ticker.chDirEnd = this.age + t;
                },
                _changeSpeed : function(cmd, ticker) {
                    var s = eval(cmd.speed.value);
                    var t = eval(cmd.term);
                    switch (cmd.speed.type) {
                    case "absolute":
                        ticker.spdFin = s;
                        ticker.spdIncr = (ticker.spdFin - ticker.speed) / t;
                        break;
                    case "relative":
                        ticker.spdFin = s + ticker.speed;
                        ticker.spdIncr = (ticker.spdFin - ticker.speed) / t;
                        break;
                    case "sequence":
                        ticker.spdIncr = s;
                        ticker.spdFin = ticker.speed + ticker.spdIncr * t;
                        break;
                    }
                    ticker.chSpdEnd = this.age + t;
                },
                _accel : function(cmd, ticker) {
                    var t = eval(cmd.term);
                    ticker.aclEnd = this.age + t;

                    if (cmd.horizontal) {
                        var h = eval(cmd.horizontal.value);
                        switch (cmd.horizontal.type) {
                        case "absolute":
                        case "sequence":
                            ticker.aclIncrH = (h - ticker.speedH) / t;
                            ticker.aclFinH = h;
                            break;
                        case "relative":
                            ticker.aclIncrH = h;
                            ticker.aclFinH = (h - ticker.speedH) * t;
                            break;
                        }
                    } else {
                        ticker.aclIncrH = 0;
                        ticker.aclFinH = ticker.speedH;
                    }

                    if (cmd.vertical) {
                        var v = eval(cmd.vertical.value);
                        switch (cmd.vertical.type) {
                        case "absolute":
                        case "sequence":
                            ticker.aclIncrV = (v - ticker.speedV) / t;
                            ticker.aclFinV = v;
                            break;
                        case "relative":
                            ticker.aclIncrV = v;
                            ticker.aclFinV = (v - ticker.speedV) * t;
                            break;
                        }
                    } else {
                        ticker.aclIncrV = 0;
                        ticker.aclFinV = ticker.speedV;
                    }
                },
                /**
                 * 攻撃パターンの元となるBulletML定義.
                 * 
                 * 解析済みのBulletMLオブジェクト.<br>
                 * 読み取り専用.
                 * 
                 * @type {BulletML.Root}
                 */
                bulletml : {
                    get : function() {
                        return this._bulletml;
                    }
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
     * ラジアンから度数に変換.
     */
    function toDegree(radian) {
        return radian * 180 / Math.PI;
    }
    /**
     * 度数からラジアンに変換.
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
