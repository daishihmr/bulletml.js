/**
 * @namespace
 */
tm.bulletml = tm.bulletml || {};

(function() {

    tm.bulletml.AttackPattern = tm.createClass(
    /** @lends tm.bulletml.AttackPattern.prototype */
    {
        /**
         * 攻撃パターン.
         *
         * @constructs
         * @param {bulletml.Root}
         *            bulletml BulletMLデータ
         */
        init: function(bulletml) {
            if (!bulletml) {
                throw new Error("argument is invalid.", bulletml);
            }
            this._bulletml = bulletml;
        },
        /**
         * enterframeイベントのリスナを作成する.<br>
         * <br>
         * 第1引数configで各種設定を行う.<br>
         *
         * @param {Object=} config
         *            発射される弾に関する設定.<br>
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
         * @param {string=} action
         *            最初に読み込むactionのラベル.省略可.
         */
        createTicker: function(config, action) {
            var topLabels = this._bulletml.getTopActionLabels();
            if (action === undefined && topLabels.length > 0) {
                // top***対応.
                // actionラベルtop***が定義されていた場合、それらを同時に動かす.
                var tickers = [];
                for ( var i = 0, end = topLabels.length; i < end; i++) {
                    tickers[tickers.length] = this._createTicker(config, topLabels[i]);
                }
                var parentTicker = function() {
                    for ( var i = tickers.length; i--; ) {
                        tickers[i].call(this);
                    }
                    if (parentTicker.compChildCount == tickers.length) {
                        parentTicker.completed = true;
                        this.dispatchEvent(tm.event.Event("completeattack"));
                    }
                };
                for ( var i = tickers.length; i--; ) {
                    tickers[i].parentTicker = parentTicker;
                }

                parentTicker.compChildCount = 0;
                parentTicker.completeChild = function() {
                    this.compChildCount++;
                };

                parentTicker.compChildCount = 0;
                parentTicker.completed = false;
                parentTicker.isDanmaku = true;

                return parentTicker;
            } else {
                return this._createTicker(config, action);
            }
        },
        /**
         * @private
         */
        _createTicker: function(config, action) {
            config = (function(base) {
                var result = {};
                var def = tm.bulletml.AttackPattern.defaultConfig;
                for ( var prop in def) {
                    if (def.hasOwnProperty(prop)) {
                        result[prop] = def[prop];
                    }
                }
                for ( var prop in base) {
                    if (base.hasOwnProperty(prop)) {
                        result[prop] = base[prop];
                    }
                }

                return result;
            })(config);

            if (!config.target) {
                throw new Error("target is undefined in config.");
            }

            var ticker = function() {
                ticker.age += 1;
                this.age = ticker.age;

                var conf = ticker.config;
                var ptn = ticker._pattern;

                if (!ptn) {
                    return;
                }

                // update direction
                if (ticker.age < ticker.chDirEnd) {
                    ticker.direction += ticker.dirIncr;
                } else if (ticker.age === ticker.chDirEnd) {
                    ticker.direction = ticker.dirFin;
                }

                // update speed
                if (ticker.age < ticker.chSpdEnd) {
                    ticker.speed += ticker.spdIncr;
                } else if (ticker.age === ticker.chSpdEnd) {
                    ticker.speed = ticker.spdFin;
                }

                // update accel
                if (ticker.age < ticker.aclEnd) {
                    ticker.speedH += ticker.aclIncrH;
                    ticker.speedV += ticker.aclIncrV;
                } else if (ticker.age === ticker.aclEnd) {
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
                    this.remove();
                    ticker.completed = true;
                    if (ticker.parentTicker) {
                        ticker.parentTicker.completeChild();
                    } else {
                        this.dispatchEvent(tm.event.Event("completeattack"));
                    }
                    return;
                }

                // set direction, speed to bullet
                if (conf.updateProperties || this.updateProperties) {
                    this.rotation = (ticker.direction + Math.PI * 0.5) * Math.RAD_TO_DEG;
                    this.speed = ticker.speed;
                }

                // proccess walker
                if (ticker.age < ticker.waitTo || ticker.completed) {
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
                        if (typeof(cmd.value) === "number") {
                            ticker.waitTo = ticker.age + cmd.value;
                        } else if ((v = ~~(cmd.value)) !== 0) {
                            ticker.waitTo = ticker.age + v;
                        } else {
                            ticker.waitTo = ticker.age + eval(cmd.value);
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
                        this.remove();
                        break;
                    case "notify":
                        ptn._notify.call(this, cmd);
                        break;
                    }
                }

                // complete
                ticker.completed = true;
                if (ticker.parentTicker) {
                    ticker.parentTicker.completeChild();
                } else {
                    this.dispatchEvent(tm.event.Event("completeattack"));
                }
            };

            action = action || "top";
            if (typeof (action) === "string") {
                ticker.walker = this._bulletml.getWalker(action, config.rank);
            } else if (action instanceof bulletml.Bullet) {
                ticker.walker = action.getWalker(config.rank);
            } else {
                window.console.error(config, action);
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
            ticker.age = -1;

            ticker.isDanmaku = true;
            return ticker;
        },
        /**
         * action要素を持たないbullet(等速直進弾)のためのtickerを作る.
         * @private
         */
        _createSimpleTicker: function(config) {
            config = (function(base) {
                var result = {};
                var def = tm.bulletml.AttackPattern.defaultConfig;
                for ( var prop in def) {
                    if (def.hasOwnProperty(prop)) {
                        result[prop] = def[prop];
                    }
                }
                for ( var prop in base) {
                    if (base.hasOwnProperty(prop)) {
                        result[prop] = base[prop];
                    }
                }

                return result;
            })(config);

            if (!config.target) {
                throw new Error("target is undefined in config.");
            }

            var ticker = function() {
                // move sprite
                this.x += ticker.deltaX;
                this.y += ticker.deltaY;

                // test out of world
                if (!ticker.config.isInsideOfWorld(this)) {
                    this.remove();
                    this.dispatchEvent(tm.event.Event("removed"));
                    return;
                }
            };

            ticker.config = config;
            ticker.direction = 0;
            ticker.speed = 0;
            ticker.deltaX = 0;
            ticker.deltaY = 0;

            ticker.isDanmaku = true;
            return ticker;
        },
        /**
         * @private
         */
        _fire: function(cmd, config, ticker, pattern) {
            var spec = { label: cmd.bullet.label };
            for (var key in cmd.bullet.option) {
                spec[key] = cmd.bullet.option[key];
            }

            var b = config.bulletFactory(spec);
            if (!b) {
                return;
            }

            // 等速直進弾?
            var uniformLinearBullet = !!cmd.bullet.actions.length;

            var bt = uniformLinearBullet ? (
                pattern._createSimpleTicker(config)
            ) : (
                pattern.createTicker(config, cmd.bullet)
            );

            var attcker = this;
            var gunPosition = {
                x: this.x + cmd.option.offsetX,
                y: this.y + cmd.option.offsetY
            };

            var calcDirection = function(d) {
                var dv = eval(d.value) * Math.DEG_TO_RAD;
                // console.debug(d.type);
                switch(d.type) {
                case "aim":
                    if (config.target) {
                        if (cmd.option.autonomy) {
                            return angleAtoB(gunPosition, config.target) + dv;
                        } else {
                            return angleAtoB(attcker, config.target) + dv;
                        }
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
                    return ticker.speed + sv;
                case "sequence":
                    return ticker.lastSpeed + sv;
                case "absolute":
                default:
                    return sv;
                }
            };
            ticker.lastSpeed = bt.speed = calcSpeed(cmd.speed || cmd.bullet.speed);

            b.x = gunPosition.x;
            b.y = gunPosition.y;

            if (uniformLinearBullet) {
                bt.deltaX = Math.cos(bt.direction) * bt.speed * config.speedRate;
                bt.deltaY = Math.sin(bt.direction) * bt.speed * config.speedRate;
            }

            // set direction, speed to bullet
            b.updateProperties = !!b.updateProperties;
            if (config.updateProperties || b.updateProperties) {
                b.rotation = (bt.direction + Math.PI * 0.5) * Math.RAD_TO_DEG;
                b.speed = bt.speed;
            }

            b.addEventListener("enterframe", bt);
            b.addEventListener("removed", function() {
                this.removeEventListener("enterframe", bt);
                this.removeEventListener("removed", arguments.callee);
            });

            if (config.onFire.call(this, b)) {
                if (config.addTarget) {
                    config.addTarget.addChild(b);
                } else if (this.parent) {
                    this.parent.addChild(b);
                }
            }
        },
        /**
         * @private
         */
        _changeDirection: function(cmd, config, ticker) {
            var d = eval(cmd.direction.value) * Math.DEG_TO_RAD;
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
                ticker.dirFin = ticker.direction + ticker.dirIncr * (t-1);
                break;
            }
            ticker.chDirEnd = ticker.age + t;
        },
        /**
         * @private
         */
        _changeSpeed: function(cmd, ticker) {
            // console.log("changeSpeed")
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
            ticker.chSpdEnd = ticker.age + t;
        },
        /**
         * @private
         */
        _accel: function(cmd, ticker) {
            var t = eval(cmd.term);
            ticker.aclEnd = ticker.age + t;

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
         * @private
         */
        _notify: function(cmd) {
            var e = tm.event.Event(cmd.eventName);
            if (cmd.params) {
                for (var key in cmd.params) {
                    e[key] = cmd.params[key];
                }
            }
            this.dispatchEvent(e);
        }
    });

    var DEFAULT_BULLET_IMAGE = (function(){
        var r = tm.graphics.Canvas();
        r.resize(8, 8);
        r.setTransformCenter();
        r.setLineStyle(0).setStrokeStyle("rgba(0,0,0,0)");
        r.setFillStyle(
            tm.graphics.RadialGradient(0,0,0,0,0,4).addColorStopList([
                { offset: 0.0, color: "white" },
                { offset: 0.5, color: "white" },
                { offset: 1.0, color: "red" },
            ]).toStyle()
        ).fillCircle(0, 0, 4);
        return r;
    })();
    /**
     * bulletFactory未指定時に使用される弾スプライトの生成関数.
     *
     * @param {Object} spec
     * @return {tm.app.Element} 8px x 8px の大きさのスプライト
     */
    tm.bulletml.defaultBulletFactory = function(spec) {
        var bullet = tm.app.Sprite(8, 8, DEFAULT_BULLET_IMAGE);
        bullet.label = spec.label;
        return bullet;
    };

    /**
     * isInsideOfWorld未指定時に使用される関数.
     *
     * @return {boolean}
     */
    var ROOT = null;
    tm.bulletml.defaultIsInsideOfWorld = function(bullet) {
        if (ROOT === null) {
            ROOT = bullet.getRoot();
        }
        return 0 <= bullet.x && bullet.x < APP.width && 0 <= bullet.y && bullet.y < APP.height;
    };

    /**
     * onFire未指定時に使用される関数.
     */
    tm.bulletml.defaultOnFire = function(bullet) {
        return true;
    };

    /**
     * configのデフォルト値.
     */
    tm.bulletml.AttackPattern.defaultConfig = {
        /** @type {function(Object): tm.app.Element} */
        bulletFactory: tm.bulletml.defaultBulletFactory,
        /** @type {function(tm.app.Element): boolean} */
        isInsideOfWorld: tm.bulletml.defaultIsInsideOfWorld,
        /** @type {function(tm.app.Element)} */
        onFire: tm.bulletml.defaultOnFire,
        /** @type {number} */
        rank: 0,
        /** @type {boolean} */
        updateProperties: false,
        /** @type {number} */
        speedRate: 2,
        /** @type {tm.app.Element} */
        target: null
    };

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
     * @param {tm.app.CanvasElement}
     *            a スプライトA
     * @param {tm.app.CanvasElement}
     *            b スプライトB
     */
    function angleAtoB(a, b) {
        return Math.atan2(b.y-a.y, b.x-a.x);
    }

    bulletml.Root.prototype.createTicker = function(config) {
        return tm.bulletml.AttackPattern(this).createTicker(config);
    };

})();
