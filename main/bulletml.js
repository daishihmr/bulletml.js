/*
 * bullet.js v0.1.0
 * @author daishi@dev7.jp
 * @description
 * BulletML parser.
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

/**
 * @namespace
 */
var BulletML = {};

(function() {
    // for IE
    if (typeof DOMParser == "undefined") {
        DOMParser = function() {
        };
        DOMParser.prototype.parseFromString = function(string, contentType) {
            if (typeof ActiveXObject != "undefined") {
                var domDoc = new ActiveXObject("MSXML.DomDocument");
                domDoc.loadXML(string);
                return domDoc;
            } else if (typeof XMLHttpRequest != "undefined") {
                var xhr = new XMLHttpRequest();
                xhr.open("GET", "data:" + (contenttype || "application/xml")
                        + ";charset=utf-8," + encodingURIComponent(string),
                        false);
                if (xhr.overrideMimeType) {
                    xhr.overrideMimeType(contentType);
                }
                xhr.send(null);
                return xhr.responseXML;
            }
        };
    }

    /**
     * BulletMLを解析し、JavaScriptオブジェクトツリーを生成する.
     * 
     * @param {String|Document}
     *            xml
     * @return {BulletML.Root}
     */
    BulletML.build = function(xml) {
        var result;
        if (typeof (xml) == "string") {
            var domParser = new DOMParser();
            result = parse(domParser.parseFromString(xml, "application/xml"));
        } else if (xml.getElementsByTagName("bulletml")) {
            result = parse(xml);
        } else {
            throw new Exception("cannot build " + xml);
        }

        // find topAction
        result.topAction = search(result.actions, "top");
        return result;
    };

    /**
     * bulletmlのルート要素.
     * 
     * @constructor
     */
    BulletML.Root = function() {
        /**
         * @type {string}
         * @field
         */
        this.type = "none";
        /**
         * @type {BulletML.Root}
         * @field
         */
        this.root = this;
        /**
         * action element labeled 'top'.
         * 
         * @type {BulletML.Action}
         * @field
         */
        this.topAction = null;
        /**
         * top level action elements.
         * 
         * @type {Array.<BulletML.Action>}
         * @field
         */
        this.actions = [];
        /**
         * top level bullet elements.
         * 
         * @type {Array.<BulletML.Bullet>}
         * @field
         */
        this.bullets = [];
        /**
         * top level fire elements.
         * 
         * @type {Array.<BulletML.Fire>}
         * @field
         */
        this.fires = [];
        /**
         * rank.
         * 
         * variable $rank.
         * 
         * @type {number}
         * @field
         */
        this.rank = 0.5;
    };
    /**
     * find top level action element by label.
     * 
     * @param {string}
     *            label label attribute value
     * @returns {BulletML.Action}
     * @memberOf BulletML.Root.prototype
     */
    BulletML.Root.prototype.findAction = function(label) {
        return search(this.actions, label);
    };
    /**
     * find top level bullet element by label.
     * 
     * @param {string}
     *            label label attribute value
     * @returns {BulletML.Bullet}
     * @memberOf BulletML.Root.prototype
     */
    BulletML.Root.prototype.findBullet = function(label) {
        return search(this.bullets, label);
    };
    /**
     * find top level fire element by label.
     * 
     * @param {string}
     *            label label attribute value
     * @returns {BulletML.Fire}
     * @memberOf BulletML.Root.prototype
     */
    BulletML.Root.prototype.findFire = function(label) {
        return search(this.fires, label);
    };
    /**
     * コマンドツリーをシーケンシャルにアクセス可能な配列に変換する.
     * 
     * 変換に際し、各種パラメータ内の変数はサブノード呼び出しパラメータ（param要素）が展開される.<br>
     * ランク（$rank）、乱数（$rand）もこの時点で確定される.
     * 
     * @param {string}
     *            label label attribute value
     * @return {Array.<BulletML.Command>}
     * @memberOf BulletML.Root.prototype
     */
    BulletML.Root.prototype.sequence = function(actionLabel) {
        if (!actionLabel && !this.topAction) {
            throw new Error("has no top action(s).");
        }
        var topAction;
        if (actionLabel) {
            topAction = this.findAction(actionLabel);
        } else {
            topAction = this.topAction;
        }
        var visitor = new BulletML.Visitor(this);
        visitor.visit(topAction);
        return visitor.result;
    };

    /**
     * @constructor
     */
    BulletML.Visitor = function(root) {
        /**
         * @type {BulletML.Root}
         * @field
         */
        this.root = root;
        /**
         * @type {Array.<BulletML.Command>}
         * @field
         */
        this.result = [];
        this.paramsStack = [];
    };
    /**
     * @memberOf BulletML.Visitor.prototype
     */
    BulletML.Visitor.prototype.visit = function(command) {
        switch (command.commandName) {
        case "action":
            for ( var i = 0, end = command.commands.length; i < end; i++) {
                this.visit(command.commands[i]);
            }
            break;
        case "actionRef":
            this.pushParams(command.params);
            var action = this.root.findAction(command.label);
            for ( var i = 0, end = action.commands.length; i < end; i++) {
                this.visit(action.commands[i]);
            }
            this.paramsStack.pop();
            break;
        case "repeat":
            var start = new BulletML.LoopStart();
            var times = evalNumber(command.times, this.params(), this.root.rank);
            var end = new BulletML.LoopEnd(start, times);

            this.result.push(start);
            this.visit(command.action);
            this.result.push(end);
            break;
        default:
            this.result.push(command.clone(this.params()));
        }
    };
    /**
     * @memberOf BulletML.Visitor.prototype
     */
    BulletML.Visitor.prototype.pushParams = function(params) {
        var cp = this.params();
        var result = [];
        for ( var i = 0, end = params.length; i < end; i++) {
            result.push(evalNumberFixRand(params[i], cp, this.root.rank))
        }
        this.paramsStack.push(result);
    };
    /**
     * @memberOf BulletML.Visitor.prototype
     */
    BulletML.Visitor.prototype.params = function() {
        if (this.paramsStack.length == 0) {
            return [];
        }
        return this.paramsStack[this.paramsStack.length - 1];
    };

    /**
     * bullet要素.
     * 
     * @constructor
     */
    BulletML.Bullet = function() {
        /**
         * @type {string}
         * @field
         */
        this.label = null;
        /**
         * @type {BulletML.Root}
         * @field
         */
        this.root = null;
        /**
         * @type {BulletML.Direction}
         * @field
         */
        this.direction = new BulletML.Direction(0);
        /**
         * @type {BulletML.Speed}
         * @field
         */
        this.speed = new BulletML.Speed(1);
        /**
         * @type {Array.<BulletML.Command>}
         * @field
         */
        this.actions = [];
    };
    /**
     * @memberOf BulletML.Bullet.prototype
     */
    BulletML.Bullet.prototype.sequence = function() {
        var visitor = new BulletML.Visitor(this.root);
        for ( var i = 0, end = this.actions.length; i < end; i++) {
            visitor.visit(this.actions[i]);
        }
        return visitor.result;
    };
    /**
     * @memberOf BulletML.Bullet.prototype
     */
    BulletML.Bullet.prototype.clone = function(params) {
        var result = new BulletML.Bullet();
        result.label = this.label;
        result.root = this.root;
        if (this.direction) {
            result.direction = new BulletML.Direction(evalNumber(
                    this.direction.value, params, this.root.rank));
            result.direction.type = this.direction.type;
        }
        if (this.speed) {
            result.speed = new BulletML.Speed(evalNumber(this.speed.value,
                    params, this.root.rank));
            result.speed.type = this.speed.type;
        }
        for ( var i = 0, end = this.actions.length; i < end; i++) {
            result.actions.push(this.actions[i].clone(params));
        }
        return result;
    };

    /**
     * @constructor
     */
    BulletML.BulletRef = function() {
        /**
         * @type {string}
         * @field
         */
        this.label = null;
        /**
         * @field
         */
        this.params = [];
    };
    BulletML.BulletRef = BulletML.BulletRef

    // commandクラス --------------------------------------------

    /**
     * 命令を表す抽象クラス.
     * 
     * Actionのcommands配列に格納される.
     * 
     * @constructor
     */
    BulletML.Command = function() {
        /**
         * @field
         */
        this.root = null;
        /**
         * @type {string}
         * @field
         */
        this.commandName = null;
    };
    /**
     * @memberOf BulletML.Command.prototype
     */
    BulletML.Command.prototype.clone = function() {
        return this;
    };

    /**
     * @constructor
     * @extends {BulletML.Command}
     */
    BulletML.Action = function() {
        /**
         * @type {string}
         * @field
         */
        this.commandName = "action";
        /**
         * @type {string}
         * @field
         */
        this.label = null;
        /**
         * @type {BulletML.Root}
         * @field
         */
        this.root = null;
        /**
         * @field
         */
        this.commands = [];
    };
    BulletML.Action.prototype = new BulletML.Command();
    /**
     * @memberOf BulletML.Action.prototype
     */
    BulletML.Action.prototype.clone = function(params) {
        var result = new BulletML.Action();
        result.label = this.label;
        result.root = this.root;
        for ( var i = 0, end = this.commands.length; i < end; i++) {
            result.commands.push(this.commands[i].clone(params));
        }
        return result;
    };

    /**
     * @constructor
     * @extends {BulletML.Command}
     */
    BulletML.ActionRef = function() {
        /**
         * @type {string}
         * @field
         */
        this.commandName = "actionRef";
        /**
         * @type {string}
         * @field
         */
        this.label = null;
        /**
         * @field
         */
        this.params = [];
    };
    BulletML.ActionRef.prototype = new BulletML.Command();
    /**
     * @memberOf BulletML.ActionRef.prototype
     */
    BulletML.ActionRef.prototype.clone = function(params) {
        var result = new BulletML.ActionRef();
        result.label = this.label;
        result.root = this.root;
        for ( var i = 0, end = this.params.length; i < end; i++) {
            result.params.push(evalNumberFixRand(this.params[i], params,
                    this.root.rank));
        }
        return result;
    };

    /**
     * @constructor
     * @extends {BulletML.Command}
     */
    BulletML.Fire = function() {
        /**
         * @type {string}
         * @field
         */
        this.commandName = "fire";
        /**
         * @type {string}
         * @field
         */
        this.label = null;
        /**
         * @type {BulletML.Root}
         * @field
         */
        this.root = null;
        /**
         * @field
         */
        this.direction = null;
        /**
         * @field
         */
        this.speed = null;
        /**
         * @field
         */
        this.bullet = null;
    };
    BulletML.Fire.prototype = new BulletML.Command();
    /**
     * @memberOf BulletML.Fire.prototype
     */
    BulletML.Fire.prototype.clone = function(params) {
        var result = new BulletML.Fire();
        result.label = this.label;
        result.root = this.root;
        if (this.direction) {
            result.direction = new BulletML.Direction(evalNumber(
                    this.direction.value, params, this.root.rank));
            result.direction.type = this.direction.type;
        }
        if (this.speed) {
            result.speed = new BulletML.Speed(evalNumber(this.speed.value,
                    params, this.root.rank));
            result.speed.type = this.speed.type;
        }

        if (this.bullet) {
            if (this.bullet instanceof BulletML.Bullet) {
                result.bullet = this.bullet.clone(params);
            } else if (this.bullet instanceof BulletML.BulletRef) {
                var origBullet = this.root.findBullet(this.bullet.label);
                if (!origBullet) {
                    return result;
                }
                var newParam = [];
                for ( var i = 0, end = this.bullet.params.length; i < end; i++) {
                    newParam.push(evalNumberFixRand(this.bullet.params[i],
                            params, this.root.rank));
                }
                result.bullet = origBullet.clone(newParam);
            }
        }
        return result;
    }

    /**
     * @constructor
     * @extends {BulletML.Command}
     */
    BulletML.FireRef = function() {
        /**
         * @type {string}
         * @field
         */
        this.commandName = "fireRef";
        /**
         * @type {string}
         * @field
         */
        this.label = null;
        /**
         * @field
         */
        this.params = [];
    };
    BulletML.FireRef.prototype = new BulletML.Command();
    /**
     * @memberOf BulletML.FireRef.prototype
     */
    BulletML.FireRef.prototype.clone = function(params) {
        var orig = this.root.findFire(this.label);
        if (orig) {
            var newParams = [];
            for ( var i = 0, end = this.params.length; i < end; i++) {
                newParams.push(evalNumberFixRand(this.params[i], params,
                        this.root.rank));
            }
            return orig.clone(newParams);
        }
    };

    /**
     * @constructor
     * @extends {BulletML.Command}
     */
    BulletML.ChangeDirection = function() {
        /**
         * @type {string}
         * @field
         */
        this.commandName = "changeDirection";
        /**
         * @field
         */
        this.direction = null;
        /**
         * @field
         */
        this.term = 0;
    };
    BulletML.ChangeDirection.prototype = new BulletML.Command();
    /**
     * @memberOf BulletML.ChangeDirection
     */
    BulletML.ChangeDirection.prototype.clone = function(params) {
        var result = new BulletML.ChangeDirection();
        result.root = this.root;
        if (this.direction) {
            result.direction = new BulletML.Direction(evalNumber(
                    this.direction.value, params, this.root.rank));
            result.direction.type = this.direction.type;
        }
        result.term = evalNumber(this.term, params, this.root.rank);
        return result;
    };

    /**
     * @constructor
     * @extends {BulletML.Command}
     */
    BulletML.ChangeSpeed = function() {
        /**
         * @type {string}
         * @field
         */
        this.commandName = "changeSpeed";
        /**
         * @field
         */
        this.speed = null;
        /**
         * @field
         */
        this.term = 0;
    };
    BulletML.ChangeSpeed.prototype = new BulletML.Command();
    /**
     * @memberOf BulletML.ChangeSpeed.prototype
     */
    BulletML.ChangeSpeed.prototype.clone = function(params) {
        var result = new BulletML.ChangeSpeed();
        result.root = this.root;
        if (this.speed) {
            result.speed = new BulletML.Speed(evalNumber(this.speed.value,
                    params, this.root.rank));
            result.speed.type = this.speed.type;
        }
        result.term = evalNumber(this.term, params, this.root.rank);
        return result;
    };

    /**
     * @constructor
     * @extends {BulletML.Command}
     */
    BulletML.Accel = function() {
        /**
         * @type {string}
         * @field
         */
        this.commandName = "accel";
        /**
         * @field
         */
        this.horizontal = null;
        /**
         * @field
         */
        this.vertical = null;
        /**
         * @field
         */
        this.term = 0;
    };
    BulletML.Accel.prototype = new BulletML.Command();
    /**
     * @memberOf BulletML.Accel.prototype
     */
    BulletML.Accel.prototype.clone = function(params) {
        var result = new BulletML.Accel();
        result.root = this.root;
        if (this.horizontal) {
            result.horizontal = new BulletML.Horizontal(evalNumber(
                    this.horizontal.value, params, this.root.rank));
            result.horizontal.type = this.horizontal.type;
        }
        if (this.vertical) {
            result.vertical = new BulletML.Vertical(evalNumber(
                    this.vertical.value, params, this.root.rank));
            result.vertical.type = this.vertical.type;
        }
        result.term = evalNumber(this.term, params, this.root.rank);
        return result;
    };

    /**
     * @constructor
     * @extends {BulletML.Command}
     */
    BulletML.Wait = function(value) {
        /**
         * @type {string}
         * @field
         */
        this.commandName = "wait";
        if (value) {
            /**
             * @type {string}
             * @field
             */
            this.value = value;
        } else {
            this.value = "0";
        }
    };
    BulletML.Wait.prototype = new BulletML.Command();
    /**
     * @memberOf BulletML.Wait.prototype
     */
    BulletML.Wait.prototype.clone = function(params) {
        var result = new BulletML.Wait(evalNumber(this.value, params,
                this.root.rank));
        result.root = this.root;
        return result;
    };

    /**
     * @constructor
     * @extends {BulletML.Command}
     */
    BulletML.Vanish = function() {
        /**
         * @type {string}
         * @field
         */
        this.commandName = "vanish";
    };
    BulletML.Vanish.prototype = new BulletML.Command();

    /**
     * @constructor
     * @extends {BulletML.Command}
     */
    BulletML.Repeat = function() {
        /**
         * @type {string}
         * @field
         */
        this.commandName = "repeat";
        /**
         * @type {string}
         * @field
         */
        this.times = "0";
        /**
         * @field
         */
        this.action = null;
    };
    BulletML.Repeat.prototype = new BulletML.Command();

    /**
     * @constructor
     * @extends {BulletML.Command}
     */
    BulletML.LoopStart = function() {
        /**
         * @type {string}
         * @field
         */
        this.commandName = "loopStart";
    };
    BulletML.LoopStart.prototype = new BulletML.Command();

    /**
     * @constructor
     * @extends {BulletML.Command}
     */
    BulletML.LoopEnd = function(start, times) {
        /**
         * @type {string}
         * @field
         */
        this.commandName = "loopEnd";
        /**
         * @field
         */
        this.start = start;
        /**
         * @type {string}
         * @field
         */
        this.times = times;
        this.loopCount = -1;
    };
    BulletML.LoopEnd.prototype = new BulletML.Command();

    // valueクラス -----------------------------------------------

    /**
     * @constructor
     */
    BulletML.Direction = function(value) {
        /**
         * @type {string}
         * @field
         */
        this.type = "aim";
        if (value) {
            /**
             * @type {string}
             * @field
             */
            this.value = value;
        } else {
            this.value = "0";
        }
    };

    /**
     * @constructor
     */
    BulletML.Speed = function(value) {
        /**
         * @type {string}
         * @field
         */
        this.type = "absolute";
        if (value) {
            /**
             * @type {string}
             * @field
             */
            this.value = value;
        } else {
            this.value = "1";
        }
    };

    /**
     * @constructor
     */
    BulletML.Horizontal = function(value) {
        /**
         * @type {string}
         * @field
         */
        this.type = "absolute";
        if (value) {
            /**
             * @type {string}
             * @field
             */
            this.value = value;
        } else {
            this.value = "0";
        }
    };

    /**
     * @constructor
     */
    BulletML.Vertical = function(value) {
        /**
         * @type {string}
         * @field
         */
        this.type = "absolute";
        if (value) {
            /**
             * @type {string}
             * @field
             */
            this.value = value;
        } else {
            this.value = "0";
        }
    };

    // parse関数 -----------------------------------------------

    function parse(element) {
        var result = new BulletML.Root();

        var root = element.getElementsByTagName("bulletml")[0];
        attr(root, "type", function(type) {
            result.type = type;
        });

        // Top Level Actions
        var actions = root.getElementsByTagName("action");
        if (actions) {
            for ( var i = 0, end = actions.length; i < end; i++) {
                var newAction = parseAction(result, actions[i]);
                if (newAction) {
                    result.actions.push(newAction);
                }
            }
        }

        // Top Level Bullets
        var bullets = root.getElementsByTagName("bullet");
        if (bullets) {
            for ( var i = 0, end = bullets.length; i < end; i++) {
                var newBullet = parseBullet(result, bullets[i]);
                if (newBullet) {
                    result.bullets.push(newBullet);
                }
            }
        }

        // Top Level Fires
        var fires = root.getElementsByTagName("fire");
        if (fires) {
            for ( var i = 0, end = fires.length; i < end; i++) {
                var newFire = parseFire(result, fires[i]);
                if (newFire) {
                    result.fires.push(newFire);
                }
            }
        }

        return result;
    }

    function parseAction(root, element) {
        var result = new BulletML.Action();
        attr(element, "label", function(label) {
            result.label = label;
        });
        each(element, ".", function(commandElm) {
            switch (commandElm.tagName) {
            case "action":
                result.commands.push(parseAction(root, commandElm));
                break;
            case "actionRef":
                result.commands.push(parseActionRef(root, commandElm));
                break;
            case "fire":
                result.commands.push(parseFire(root, commandElm));
                break;
            case "fireRef":
                result.commands.push(parseFireRef(root, commandElm));
                break;
            case "changeDirection":
                result.commands.push(parseChangeDirection(root, commandElm));
                break;
            case "changeSpeed":
                result.commands.push(parseChangeSpeed(root, commandElm));
                break;
            case "accel":
                result.commands.push(parseAccel(root, commandElm));
                break;
            case "wait":
                result.commands.push(parseWait(root, commandElm));
                break;
            case "vanish":
                result.commands.push(parseVanish(root, commandElm));
                break;
            case "repeat":
                result.commands.push(parseRepeat(root, commandElm));
                break;
            }
        });

        result.root = root;
        return result;
    }

    function parseActionRef(root, element) {
        var result = new BulletML.ActionRef();

        attr(element, "label", function(label) {
            result.label = label;
        });
        each(element, /param$/, function(param) {
            result.params.push(text(param));
        });
        result.root = root;

        return result;
    }

    function parseBullet(root, element) {
        var result = new BulletML.Bullet();

        attr(element, "label", function(label) {
            result.label = label;
        });
        get(element, "direction", function(direction) {
            result.direction = parseDirection(direction);
        });
        get(element, "speed", function(speed) {
            result.speed = parseSpeed(speed);
        });
        each(element, /(action)|(actionRef)$/, function(action) {
            if (action.tagName == "action") {
                result.actions.push(parseAction(root, action));
            } else if (action.tagName == "actionRef") {
                result.actions.push(parseActionRef(root, action));
            }
        });
        result.root = root;

        return result;
    }

    function parseBulletRef(root, element) {
        var result = new BulletML.BulletRef();

        attr(element, "label", function(label) {
            result.label = label;
        });
        each(element, /param$/, function(param) {
            result.params.push(text(param));
        });
        result.root = root;

        return result;
    }

    function parseFire(root, element) {
        var result = new BulletML.Fire();

        attr(element, "label", function(label) {
            result.label = label;
        });
        get(element, "direction", function(direction) {
            result.direction = parseDirection(direction);
        })
        get(element, "speed", function(speed) {
            result.speed = parseSpeed(speed);
        })
        get(element, "bullet", function(bullet) {
            result.bullet = parseBullet(root, bullet);
        });
        get(element, "bulletRef", function(bulletRef) {
            result.bullet = parseBulletRef(root, bulletRef);
        });

        if (!result.bullet && !result.bulletRef) {
            throw new Exception("fire has no bullet or bulletRef.");
        }

        result.root = root;
        return result;
    }

    function parseFireRef(root, element) {
        var result = new BulletML.FireRef();

        attr(element, "label", function(label) {
            result.label = label;
        });
        each(element, /param$/, function(param) {
            result.params.push(text(param));
        });
        result.root = root;

        return result;
    }

    function parseChangeDirection(root, element) {
        var result = new BulletML.ChangeDirection();
        result.root = root;

        get(element, "direction", function(direction) {
            result.direction = parseDirection(direction);
        });
        get(element, "term", function(term) {
            result.term = text(term);
        });

        return result;
    }

    function parseChangeSpeed(root, element) {
        var result = new BulletML.ChangeSpeed();
        result.root = root;

        get(element, "speed", function(speed) {
            result.speed = parseSpeed(speed);
        });
        get(element, "term", function(term) {
            result.term = text(term);
        });

        return result;
    }

    function parseAccel(root, element) {
        var result = new BulletML.Accel();
        result.root = root;

        get(element, "horizontal", function(horizontal) {
            result.horizontal = parseHorizontal(horizontal);
        });
        get(element, "vertical", function(vertical) {
            result.vertical = parseVertical(vertical);
        });
        get(element, "term", function(term) {
            result.term = text(term);
        });

        return result;
    }

    function parseWait(root, element) {
        var result = new BulletML.Wait();
        result.root = root;

        result.value = text(element);

        return result;
    }

    function parseVanish(root, element) {
        var result = new BulletML.Vanish();
        result.root = root;
        return result;
    }

    function parseRepeat(root, element) {
        var result = new BulletML.Repeat();

        get(element, "action", function(action) {
            result.action = parseAction(root, action);
        });
        get(element, "actionRef", function(actionRef) {
            result.action = parseActionRef(root, actionRef);
        });
        get(element, "times", function(times) {
            result.times = text(times);
        });

        return result;
    }

    function parseDirection(element) {
        return setTypeAndValue(new BulletML.Direction(), element);
    }

    function parseSpeed(element) {
        return setTypeAndValue(new BulletML.Speed(), element);
    }

    function parseHorizontal(element) {
        return setTypeAndValue(new BulletML.Horizontal(), element);
    }

    function parseVertical(element) {
        return setTypeAndValue(new BulletML.Vertical(), element);
    }

    function setTypeAndValue(obj, element) {
        attr(element, "type", function(type) {
            obj.type = type;
        });
        text(element, function(val) {
            obj.value = val;
        });
        return obj;
    }

    // utility ---------------------------------------------------

    function evalNumberFixRand(value, params, rank) {
        if (typeof (value) == "number") {
            return value;
        }
        value = value.replace(/\$rand/g, "(" + Math.random() + ")");
        value = value.replace(/\$rank/g, "(" + rank + ")");
        if (params) {
            for ( var i = 0, end = params.length; i < end; i++) {
                var pat = new RegExp("\\$" + (i + 1), "g");
                value = value.replace(pat, "(" + params[i] + ")");
            }
        }
        return value;
    }

    function evalNumber(value, params, rank) {
        if (typeof (value) == "number") {
            return value;
        }
        value = value.replace(/\$rand/g, "Math.random()");
        value = value.replace(/\$rank/g, "(" + rank + ")");
        if (params) {
            for ( var i = 0, end = params.length; i < end; i++) {
                var pat = new RegExp("\\$" + (i + 1), "g");
                value = value.replace(pat, "(" + params[i] + ")");
            }
        }
        return value;
    }

    function search(array, label) {
        for ( var i = 0, end = array.length; i < end; i++) {
            if (array[i].label == label) {
                return array[i];
            }
        }
    }

    function get(element, tagName, callback, ifNotFound) {
        var children = element.childNodes;
        for ( var i = 0, end = children.length; i < end; i++) {
            if (children[i].tagName && children[i].tagName == tagName) {
                if (callback) {
                    callback(children[i]);
                }
                return callback(children[i]);
            }
        }
        if (ifNotFound) {
            ifNotFound();
        }
    }
    function each(element, filter, callback) {
        var children = element.childNodes;
        for ( var i = 0, end = children.length; i < end; i++) {
            if (children[i].tagName && children[i].tagName.match(filter)) {
                callback(children[i]);
            }
        }
    }
    function attr(element, attrName, callback, ifNotFound) {
        // for IE
        var attrs;
        if (element.attributes.item(0)) {
            attrs = {};
            var i = 0;
            while (element.attributes.item(i)) {
                var item = element.attributes.item(i);
                if (item.value != "" && item.value != "null") {
                    attrs[item.name] = {
                        value : item.value
                    };
                }
                i++;
            }
        } else {
            attrs = element.attributes;
        }

        var attr = attrs[attrName];
        if (attr) {
            if (callback) {
                callback(attr.value);
            }
            return attr;
        } else if (ifNotFound) {
            ifNotFound();
        }
    }
    function text(element, callback) {
        var result = element.textContent;
        if (result !== undefined) {
            if (callback) {
                callback(result);
            }
            return result;
        }

        // for IE
        if (element.childNodes[0]) {
            result = element.childNodes[0].nodeValue;
            if (result !== undefined) {
                if (callback) {
                    callback(result);
                }
                return result;
            }
        }
    }

})();
