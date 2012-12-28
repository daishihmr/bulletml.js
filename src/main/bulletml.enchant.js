/**
 * @fileOverview bullet.enchant.js
 * @version 0.4.1
 * @require enchant.js v0.5.2+, bulletml-min.js v0.3.1
 * @author daishi_hmr
 *
 * @description 弾幕記述言語BulletMLをenchant.jsで扱うためのプラグイン
 *
 * @detail BulletMLのパースにはbulletml.jsを使用しています
 *      bulletml.js: https://github.com/daishihmr/bulletml.js
 *
 * @example
 *      game.preload('boss.bml');
 *      ...
 *      var player = new Sprite(32, 32);
 *      var boss = new Sprite(32, 32);
 *      var attackPattern = game.assets['boss.xml'];
 *      var ticker = attackPattern.createTicker(player);
 *      boss.addEventListener('enterframe', ticker);
 *
 * @example
 *      game.preload('boss.bml');
 *      ...
 *      var player = new Sprite(32, 32);
 *      AttackPattern.defaultConfig.target = player;
 *      var boss = new Sprite(32, 32);
 *      boss.setDanmaku(game.assets['boss.bml']);
 */

/**
 * @namespace
 */
enchant.bulletml = enchant.bulletml || {};

(function() {

    // BulletML(*.bml, *.xml)をpreloadで読み込めるようにする.
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
                    var bulletml = BulletML.build(xhr.responseXML);
                    if (bulletml) {
                        game.assets[src] = new enchant.bulletml.AttackPattern(
                                bulletml);
                    } else {
                        alert(src + "は妥当なBulletMLではありません。");
                        game.assets[src] = xhr.responseXML;
                    }
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

    // syntax sugar.
    /**
     * 弾幕enterframeイベントリスナを設定する.
     *
     * @scope enchant.EventTarget.prototype
     */
    enchant.EventTarget.prototype.setDanmaku = function(attackPattern, config) {
        if (attackPattern === void 0) throw new Error("AttackPattern is required.");
        this.removeDanmaku();
        this.on("enterframe", attackPattern.createTicker(config));
    };
    enchant.EventTarget.prototype.removeDanmaku = function() {
        if (!this._listeners["enterframe"]
                || this._listeners["enterframe"].length === 0) {
            return;
        }
        var remove = [];
        for ( var i = this._listeners["enterframe"].length; i--;) {
            if (this._listeners["enterframe"][i].isDanmaku) {
                remove[remove.length] = this._listeners["enterframe"][i];
            }
        }
        for ( var i = remove.length; i--;) {
            this.removeEventListener("enterframe", remove[i]);
        }
    };

    /**
     * 弾の画像が指定されなかった場合に使用される.
     *
     * 8px x 8px.赤い球状の弾.
     *
     * @type {enchant.Surface}
     * @memberOf enchant.bulletml
     */
    enchant.bulletml.getDefaultImage = function() {
        if (this.value) {
            return this.value;
        } else {
            var s = new enchant.Surface(8, 8);
            var c = s.context;
            var g = c.createRadialGradient(4, 4, 0, 4, 4, 4);
            g.addColorStop(0.0, "rgba(255,255,255,1.0)");
            g.addColorStop(0.5, "rgba(255,255,255,1.0)");
            g.addColorStop(0.8, "rgba(255,  0,  0,0.8)");
            g.addColorStop(1.0, "rgba(255,  0,  0,0.0)");
            c.fillStyle = g;
            c.fillRect(0, 0, 8, 8);
            this.value = s;
            return s;
        }
    };

    /**
     * @scope enchant.bulletml.AttackPattern.prototype
     */
    enchant.bulletml.AttackPattern = enchant.Class.create({
        /**
         * 攻撃パターン.
         *
         * @constructs
         * @param {BulletML.Root}
         *            bulletml BulletMLデータ
         */
        initialize : function(bulletml) {
            if (!bulletml) {
                throw new Error("argument is invalid.", bulletml);
            }
            this._bulletml = bulletml;
        },
        /**
         * enterframeイベントのリスナを作成する.<br>
         * <br>
         * 第1引数configで各種設定を行う. <br>
         *
         *
         * @param {Object|enchant.Node}
         *            [config] 発射される弾に関する設定.<br>
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
         *            <td>isInsideOfWorld</td>
         *            <td>function</td>
         *            <td>弾が画面内に存在することを判定する関数</td>
         *            <td>Gameインスタンスの大きさをベースにして判定する</td>
         *            <td></td>
         *            </tr>
         *            <tr>
         *            <td>rank</td>
         *            <td>number</td>
         *            <td>弾幕ランク.BulletMLの$rankに対応する.0.0～1.0の範囲で指定.</td>
         *            <td>0</td>
         *            <td></td>
         *            </tr>
         *            <tr>
         *            <td>speedRate</td>
         *            <td>number</td>
         *            <td>弾速度の補正倍率.</td>
         *            <td>1</td>
         *            <td></td>
         *            </tr>
         *            </table>
         *            設定する項目がtargetのみの場合、標的オブジェクトを直接引数として渡すことが可能.
         * @param {string}
         *            [action] 最初に読み込むactionのラベル.<br>
         *            省略可.
         */
        createTicker : function(config, action) {
            var topLabels = this._bulletml.getTopActionLabels()
            if (action === void 0 && topLabels.length > 1) {
                // top***対応.
                // actionラベルtop***が定義されていた場合、それらを同時に動かす.
                var tickers = [];
                for ( var i = 0, end = topLabels.length; i < end; i++) {
                    tickers[tickers.length] = this._createTicker(config, topLabels[i]);
                }
                var parentTicker = function() {
                    if (parentTicker.complete) {
                        return;
                    }
                    for ( var i = tickers.length; i--;) {
                        tickers[i].call(this);
                    }
                    if (parentTicker.compChildCount == tickers.length) {
                        parentTicker.complete = true;
                        this.dispatchEvent(new Event("completeattack"));
                    }
                };
                for ( var i = tickers.length; i--;) {
                    tickers[i].parentTicker = parentTicker;
                }

                parentTicker.compChildCount = 0;
                parentTicker.completeChild = function() {
                    this.compChildCount++;
                };

                parentTicker.compChildCount = 0;
                parentTicker.complete = false;
                parentTicker.isDanmaku = true;

                return parentTicker;
            } else {
                return this._createTicker(config, action);
            }
        },
        _createTicker : function(config, action) {
            config = (function(base) {
                var result = {};
                var def = enchant.bulletml.AttackPattern.defaultConfig;
                for ( var prop in def) {
                    if (def.hasOwnProperty(prop)) {
                        if (base !== void 0) {
                            result[prop] = base[prop] || def[prop];
                        } else {
                            result[prop] = def[prop];
                        }
                    }
                }

                return result;
            })(config);

            if (!config.target) {
                throw new Error("target is undefined in config.");
            }

            // var ticker = tickerPool.get();
            var ticker = function() {
                var conf = ticker.config;
                var ptn = ticker._pattern;

                if (!ptn) {
                    return;
                }

                // update direction
                if (this.age < ticker.chDirEnd) {
                    ticker.direction += ticker.dirIncr;
                } else if (this.age == ticker.chDirEnd) {
                    ticker.direction = ticker.dirFin;
                }

                // update speed
                if (this.age < ticker.chSpdEnd) {
                    ticker.speed += ticker.spdIncr;
                } else if (this.age == ticker.chSpdEnd) {
                    ticker.speed = ticker.spdFin;
                }

                // update accel
                if (this.age < ticker.aclEnd) {
                    ticker.speedH += ticker.aclIncrH;
                    ticker.speedV += ticker.aclIncrV;
                } else if (this.age == ticker.aclEnd) {
                    ticker.speedH = ticker.aclFinH;
                    ticker.speedV = ticker.aclFinV;
                }

                // move sprite
                this.x += Math.cos(ticker.direction) * ticker.speed * conf.speedRate;
                this.y += Math.sin(ticker.direction) * ticker.speed * conf.speedRate;
                this.x += ticker.speedH * conf.speedRate;
                this.y += ticker.speedV * conf.speedRate;

                // test out of world
                if (!conf.isInsideOfWorld(this)) {
                    if (this.parentNode) this.parentNode.removeChild(this);
                    ticker.completed = true;
                    if (ticker.parentTicker) {
                        ticker.parentTicker.completeChild();
                    } else {
                        this.dispatchEvent(new Event("completeattack"));
                    }
                    return;
                }

                // set direction, speed to bullet
                if (conf.updateProperties) {
                    this.direction = (ticker.direction + Math.PI / 2) * RAD_TO_DEG;
                    this.speed = ticker.speed;
                }

                // proccess walker
                if (this.age < ticker.waitTo || ticker.completed) {
                    return;
                }
                var cmd;
                while (cmd = ticker.walker.next()) {
                    switch (cmd.commandName) {
                    case "fire":
                        ptn._fire.call(this, cmd, conf, ticker, ptn);
                        break;
                    case "wait":
                        var v = 0;
                        if (typeof(cmd.value) === 'number') {
                            ticker.waitTo = this.age + cmd.value;
                        } else if ((v = ~~(cmd.value)) !== 0) {
                            ticker.waitTo = this.age + v;
                        } else {
                            ticker.waitTo = this.age + eval(cmd.value);
                        }
                        return;
                    case "changeDirection":
                        ptn._changeDirection.call(this, cmd, conf, ticker);
                        break;
                    case "changeSpeed":
                        ptn._changeSpeed.call(this, cmd, ticker);
                        break;
                    case "accel":
                        ptn._accel.call(this, cmd, ticker);
                        break;
                    case "vanish":
                        if (this.parentNode) this.parentNode.removeChild(this);
                        break;
                    }
                }

                // complete
                ticker.completed = true;
                if (ticker.parentTicker) {
                    ticker.parentTicker.completeChild();
                } else {
                    this.dispatchEvent(new Event("completeattack"));
                }
            };

            action = action || "top";
            if (typeof (action) === "string") {
                ticker.walker = this._bulletml.getWalker(action, config.rank);
            } else if (action instanceof BulletML.Bullet) {
                ticker.walker = action.getWalker(config.rank);
            } else {
                console.error(config, action);
                throw new Error("引数が不正");
            }

            ticker._pattern = this;
            ticker.config = config;
            ticker.waitTo = -1;
            ticker.completed = false;
            ticker.direction = 0;
            ticker.lastDirection = 0;
            ticker.speed = 0;
            ticker.lastSpeed = 0;
            ticker.speedH = 0;
            ticker.speedV = 0;
            ticker.dirIncr = 0;
            ticker.dirFin = 0;
            ticker.chDirEnd = -1;
            ticker.spdIncr = 0;
            ticker.spdFin = 0;
            ticker.chSpdEnd = -1;
            ticker.aclIncrH = 0;
            ticker.aclFinH = 0;
            ticker.aclIncrV = 0;
            ticker.aclFinV = 0;
            ticker.aclEnd = -1;

            ticker.isDanmaku = true;
            return ticker;
        },
        _fire : function(cmd, config, ticker, pattern) {
            var b = config.bulletFactory({
                label : cmd.bullet.label
            });
            if (!b) {
                return;
            }

            var bt = pattern.createTicker(config, cmd.bullet);

            var attacker = this;
            var calcDirection = function(d) {
                var dv = eval(d.value) * DEG_TO_RAD;
                // console.debug(d.type);
                switch (d.type) {
                case "aim":
                    if (config.target) {
                        return angleAtoB(attacker, config.target) + dv;
                    } else {
                        return dv - Math.PI / 2;
                    }
                case "absolute":
                    return dv - Math.PI / 2; // 真上が0度
                case "relative":
                    return ticker.direction + dv;
                case "sequence":
                default:
                    // console.debug(ticker.lastDirection, dv);
                    return ticker.lastDirection + dv;
                }
            };
            ticker.lastDirection = bt.direction = calcDirection(cmd.direction || cmd.bullet.direction);
            // console.debug(bt.direction);

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
            ticker.lastSpeed = bt.speed = calcSpeed(cmd.speed || cmd.bullet.speed);

            b.x = this.x + ((this.width || 0) - (b.width || 0)) / 2;
            b.y = this.y + ((this.height || 0) - (b.height || 0)) / 2;

            b.addEventListener("enterframe", bt);
            b.addEventListener("removed", function() {
                this.removeEventListener("enterframe", bt);
            });
            if (config.addTarget) {
                config.addTarget.addChild(b);
            } else if (this.parentNode) {
                this.parentNode.addChild(b);
            }
        },
        _changeDirection : function(cmd, config, ticker) {
            var d = eval(cmd.direction.value) * DEG_TO_RAD;
            var t = eval(cmd.term);
            switch (cmd.direction.type) {
            case "aim":
                var tar = config.target;
                if (!tar) {
                    return;
                }
                ticker.dirFin = angleAtoB(this, tar) + d;
                ticker.dirIncr = normalizeRadian(ticker.dirFin - ticker.direction) / t;
                break;
            case "absolute":
                ticker.dirFin = d - Math.PI / 2;
                ticker.dirIncr = normalizeRadian(ticker.dirFin - ticker.direction) / t;
                break;
            case "relative":
                ticker.dirFin = ticker.direction + d;
                ticker.dirIncr = normalizeRadian(ticker.dirFin - ticker.direction) / t;
                break;
            case "sequence":
                ticker.dirIncr = d;
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
         * @type BulletML.Root
         */
        bulletml : {
            get : function() {
                return this._bulletml;
            }
        }
    });

    /**
     * bulletFactory未指定時に使用される弾スプライトの生成関数.
     *
     * @returns {enchant.Sprite} 8px x 8px の大きさのスプライト
     * @type function
     * @memberOf enchant.bulletml
     */
    enchant.bulletml.defaultBulletFactory = function() {
        var bullet = new enchant.Sprite(8, 8);
        bullet.image = enchant.bulletml.getDefaultImage();
        return bullet;
    };

    var _game = undefined;
    /**
     * isInsideOfWorld未指定時に使用される関数.
     */
    enchant.bulletml.defaultIsInsideOfWorld = function(bullet) {
        if (_game === void 0) {
            _game = enchant.Game.instance;
        }
        var scw = _game.width;
        var sch = _game.height;
        var w = bullet.width || 0;
        var h = bullet.height || 0;
        return (-w <= bullet.x && bullet.x < scw && -h <= bullet.y && bullet.y < sch);
    };

    /**
     * configのデフォルト値.
     *
     * @scope enchant.bulletml.AttackPattern
     */
    enchant.bulletml.AttackPattern.defaultConfig = {
        bulletFactory : enchant.bulletml.defaultBulletFactory,
        isInsideOfWorld : enchant.bulletml.defaultIsInsideOfWorld,
        rank : 0,
        updateProperties : false,
        speedRate : 2
    };

    var RAD_TO_DEG = 180 / Math.PI;
    var DEG_TO_RAD = Math.PI / 180;

    /**
     * ラジアンを -π<= rad < π の範囲に正規化する.
     */
    function normalizeRadian(radian) {
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
    function angleAtoB(a, b) {
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
