/*
 * bullet.js v0.3.1
 * @author daishi@dev7.jp
 * @description
 * General-purpose parser BulletML.
 * 
 * This project has hosted by github.com (https://github.com/daishihmr/bulletml.js).
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

/**
 * @namespace
 */
var BulletML = {};
BulletML.global = this;

(function() {
    /**
     * BulletMLを解析し、JavaScriptオブジェクトツリーを生成する.
     * 
     * @param {String|Document|Object} data 弾幕定義
     * @return {BulletML.Root}
     */
    BulletML.build = function(data) {
        var result;
        if (typeof (data) == "string") {
            var domParser = new DOMParser();
            result = parse(domParser.parseFromString(data, "application/xml"));
        } else if (data.getElementsByTagName("bulletml")) {
            result = parse(data);
        } else {
            throw new Error("cannot build " + data);
        }
        return result;
    };

    /**
     * bulletmlのルート要素.
     * 
     * @constructor
     */
    BulletML.Root = function(data) {
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

        if (data) {
            for (var prop in data) if (data.hasOwnProperty(prop)) {
                data[prop].label = prop;
                if (data[prop] instanceof BulletML.Action) {
                    this.actions.push(data[prop]);
                } else if (data[prop] instanceof BulletML.Bullet) {
                    this.bullets.push(data[prop]);
                } else if (data[prop] instanceof BulletML.Fire) {
                    this.fires.push(data[prop]);
                }
            }
            this.setRoot(this);
        }
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
     * find actions label starts with 'top'.
     * 
     * @returns Array.<BulletML.Action>
     * @memberOf BulletML.Root.prototype
     */
    BulletML.Root.prototype.getTopActionLabels = function() {
        var result = [];
        for ( var i = 0, end = this.actions.length; i < end; i++) {
            var action = this.actions[i];
            if (action.label && action.label.indexOf("top") === 0) {
                result[result.length] = action.label;
            }
        }
        return result;
    };
    /**
     * find top level action element by label. throw error if action is
     * undefined.
     * 
     * @param {string}
     *            label label attribute value
     * @returns {BulletML.Action}
     * @memberOf BulletML.Root.prototype
     */
    BulletML.Root.prototype.findActionOrThrow = function(label) {
        var result;
        if (result = this.findAction(label)) {
            return result;
        } else {
            throw new Error("action labeled '" + label + "' is undefined.");
        }
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
     * find top level bullet element by label. throw error if bullet is
     * undefined.
     * 
     * @param {string}
     *            label label attribute value
     * @returns {BulletML.Bullet}
     * @memberOf BulletML.Root.prototype
     */
    BulletML.Root.prototype.findBulletOrThrow = function(label) {
        var result;
        if (result = this.findBullet(label)) {
            return result;
        } else {
            throw new Error("bullet labeled '" + label + "' is undefined.");
        }
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
     * find top level fire element by label. throw error if fire is undefined.
     * 
     * @param {string}
     *            label label attribute value
     * @returns {BulletML.Fire}
     * @memberOf BulletML.Root.prototype
     */
    BulletML.Root.prototype.findFireOrThrow = function(label) {
        var result;
        if (result = this.findFire(label)) {
            return result;
        } else {
            throw new Error("fire labeled '" + label + "' is undefined.");
        }
    };
    BulletML.Root.prototype.getWalker = function(actionLabel, rank) {
        var w = new BulletML.Walker(this, rank);
        var action = this.findAction(actionLabel);
        if (action) {
            w._action = action;
            return w;
        }
    };
    BulletML.Root.prototype.setRoot = function() {
        for (var i = 0, end = this.actions.length; i < end; i++) {
            this.actions[i].setRoot(this);
        }
        for (var i = 0, end = this.bullets.length; i < end; i++) {
            this.bullets[i].setRoot(this);
        }
        for (var i = 0, end = this.fires.length; i < end; i++) {
            this.fires[i].setRoot(this);
        }
    };

    BulletML.Walker = function(root, rank) {
        this._root = root;
        /** callstack. */
        this._stack = [];
        /** program counter. */
        this._cursor = -1;
        /** current stack. */
        this._action = null;
        /** current localScope variables. */
        this._localScope = {};
        /** globalScope variables. */
        this._globalScope = {
            $rank : rank || 0
        };
    };
    BulletML.Walker.prototype.next = function() {
        this._cursor += 1;
        if (this._action) {
            var n = this._action.commands[this._cursor];

            if (n) {
                var result = {
                    commandName : n.commandName
                };
                switch (n.commandName) {
                case "action":
                    this.pushStack();
                    this._action = n;
                    this._localScope = this.newScope(n.params);
                    return this.next();
                case "actionRef":
                    this.pushStack();
                    this._action = this._root.findActionOrThrow(n.label);
                    this._localScope = this.newScope(n.params);
                    return this.next();
                case "repeat":
                    this._localScope.loopCounter = 0;
                    this._localScope.loopEnd = this.eval(n.times);
                    // console.log("repeat begin", this._localScope.loopCounter,
                    // this._localScope.loopEnd);
                    this.pushStack();
                    this._action = {
                        commandName : "action",
                        commands : [ n.action ]
                    };
                    this._localScope = this.newScope(n.params);
                    return this.next();
                case "fire":
                    result.bullet = n.bullet.clone(this);
                    if (n.direction) {
                        result.direction = {
                            type : n.direction.type,
                            value : this.eval(n.direction.value)
                        };
                    }
                    if (n.speed) {
                        result.speed = {
                            type : n.speed.type,
                            value : this.eval(n.speed.value)
                        }
                    }
                    break;
                case "fireRef":
                    this.pushStack();
                    this._action = {
                        commandName : "action",
                        commands : [ this._root.findFireOrThrow(n.label) ]
                    };
                    this._localScope = this.newScope(n.params);
                    return this.next();
                case "changeDirection":
                    if (n.direction) {
                        result.direction = {
                            type : n.direction.type,
                            value : this.eval(n.direction.value)
                        };
                    }
                    if (n.term) {
                        result.term = this.eval(n.term);
                    }
                    break;
                case "changeSpeed":
                    if (n.speed) {
                        result.speed = {
                            type : n.speed.type,
                            value : this.eval(n.speed.value)
                        }
                    }
                    if (n.term) {
                        result.term = this.eval(n.term);
                    }
                    break;
                case "accel":
                    if (n.horizontal) {
                        result.horizontal = {
                            type : n.horizontal.type,
                            value : this.eval(n.horizontal.value)
                        };
                    }
                    if (n.vertical) {
                        result.vertical = {
                            type : n.vertical.type,
                            value : this.eval(n.vertical.value)
                        };
                    }
                    if (n.term) {
                        result.term = this.eval(n.term);
                    }
                    break;
                case "wait":
                    result.value = this.eval(n.value);
                    break;
                }
                return result;
            } else {
                this.popStack();
                if (!this._action) {
                    return;
                }
                n = this._action.commands[this._cursor];
                if (n && n.commandName == "repeat") {
                    // console.log("repeat end", this._localScope.loopCounter,
                    // this._localScope.loopEnd);
                    this._localScope.loopCounter++;
                    if (this._localScope.loopCounter < this._localScope.loopEnd) {
                        this.pushStack();
                        this._action = {
                            commandName : "action",
                            commands : [ n.action ]
                        };
                        this._localScope = this.newScope(n.params);
                        return this.next();
                    } else {
                        return this.next();
                    }
                } else {
                    return this.next();
                }
            }
        }
    };
    BulletML.Walker.prototype.pushStack = function() {
        this._stack.push({
            action : this._action,
            cursor : this._cursor,
            scope : this._localScope
        });
        this._cursor = -1;
    };
    BulletML.Walker.prototype.popStack = function() {
        var p = this._stack.pop();
        if (p) {
            this._cursor = p.cursor;
            this._action = p.action;
            this._localScope = p.scope;
        } else {
            this._cursor = -1;
            this._action = null;
            this._localScope = {};
        }
    };
    BulletML.Walker.prototype.eval = function(exp) {
        // console.log("eval", exp, this._localScope);
        // evalを使わずに済む場合
        var n;
        if (typeof exp == "number") {
            return exp;
        } else if (!isNaN(n = Number(exp))) {
            return n;
        } else if (n = this._localScope[exp]) {
            return n;
        } else if (n = this._globalScope[exp]) {
            return n;
        } else if (exp == "$rand") {
            return Math.random();
        }

        var scope = {};
        for ( var prop in this._globalScope) {
            if (this._globalScope.hasOwnProperty(prop)) {
                scope[prop] = this._globalScope[prop];
            }
        }
        for ( var prop in this._localScope) {
            if (this._localScope.hasOwnProperty(prop)) {
                scope[prop] = this._localScope[prop];
            }
        }
        scope.$rand = Math.random();
        return eval(
                "BulletML._temp = function() { return "
                        + exp.split("$").join("this.$") + "}").bind(scope)();
    };
    BulletML.Walker.prototype.newScope = function(params) {
        var result = {};
        if (params) {
            for ( var i = 0, end = params.length; i < end; i++) {
                result["$" + (i + 1)] = this.eval(params[i]);
            }
        } else {
            for ( var prop in this._localScope)
                if (this._localScope.hasOwnProperty(prop)) {
                    result[prop] = this._localScope[prop];
                }
        }
        return result;
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
        this._localScope = {};
    };
    BulletML.Bullet.prototype.getWalker = function(rank) {
        var w = new BulletML.Walker(this.root, rank);
        var action = new BulletML.Action();
        action.root = this.root;
        action.commands = this.actions;
        w._action = action;
        w._localScope = this._localScope;
        return w;
    };
    BulletML.Bullet.prototype.clone = function(walker) {
        var c = new BulletML.Bullet();
        c.label = this.label;
        c.root = this.root;
        c.actions = this.actions;
        c.direction = {
            type : this.direction.type,
            value : walker.eval(this.direction.value)
        };
        c.speed = {
            type : this.speed.type,
            value : walker.eval(this.speed.value)
        };
        c._localScope = walker._localScope;
        return c;
    };
    BulletML.Bullet.prototype.setRoot = function(root) {
        this.root = root;
        for (var i = 0, end = this.actions.length; i < end; i++) {
            this.actions[i].setRoot(root);
        }
    };

    /**
     * @constructor
     */
    BulletML.BulletRef = function() {
        this.root = null;
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
    BulletML.BulletRef.prototype.clone = function(walker) {
        var bkup = walker._localScope;
        walker._localScope = walker.newScope(this.params);
        var b = this.root.findBulletOrThrow(this.label).clone(walker);
        walker._localScope = bkup;
        return b;
    };
    BulletML.BulletRef.prototype.setRoot = function(root) {
        this.root = root;
    };

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
         * @type {string}
         * @field
         */
        this.commandName = null;
    };
    BulletML.Command.prototype.setRoot = function(root) {
        this.root = root;
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
    BulletML.Action.prototype.setRoot = function(root) {
        this.root = root;
        for (var i = 0, end = this.commands.length; i < end; i++) {
            this.commands[i].setRoot(root);
        }
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
         * @type {BulletML.Root}
         * @field
         */
        this.root = null;
        /**
         * @field
         */
        this.params = [];
    };
    BulletML.ActionRef.prototype = new BulletML.Command();

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
    BulletML.Fire.prototype.setRoot = function(root) {
        this.root = root;
        // console.log("this.bullet = ", this.bullet);
        if (this.bullet) this.bullet.setRoot(root);
    };

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
            this.value = 0;
        }
    };
    BulletML.Wait.prototype = new BulletML.Command();

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
        this.times = 0;
        /**
         * @field
         */
        this.action = null;
    };
    BulletML.Repeat.prototype = new BulletML.Command();
    BulletML.Repeat.prototype.setRoot = function(root) {
        this.root = root;
        if (this.action) this.action.setRoot(root);
    };

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
            this.value = 0;
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
            this.value = 1;
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
            this.value = 0;
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
            this.value = 0;
        }
    };

    // parse関数 -----------------------------------------------

    function parse(element) {
        var result = new BulletML.Root();

        var root = element.getElementsByTagName("bulletml")[0];
        if (!root) {
            return;
        }

        attr(root, "type", function(type) {
            result.type = type;
        });

        // Top Level Actions
        var actions = root.getElementsByTagName("action");
        if (actions) {
            for ( var i = 0, end = actions.length; i < end; i++) {
                var newAction = parseAction(result, actions[i]);
                if (newAction) {
                    result.actions[result.actions.length] = newAction;
                }
            }
        }

        // Top Level Bullets
        var bullets = root.getElementsByTagName("bullet");
        if (bullets) {
            for ( var i = 0, end = bullets.length; i < end; i++) {
                var newBullet = parseBullet(result, bullets[i]);
                if (newBullet) {
                    result.bullets[result.bullets.length] = newBullet;
                }
            }
        }

        // Top Level Fires
        var fires = root.getElementsByTagName("fire");
        if (fires) {
            for ( var i = 0, end = fires.length; i < end; i++) {
                var newFire = parseFire(result, fires[i]);
                if (newFire) {
                    result.fires[result.fires.length] = newFire;
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
                result.commands[result.commands.length] = parseAction(root,
                        commandElm);
                break;
            case "actionRef":
                result.commands[result.commands.length] = parseActionRef(root,
                        commandElm);
                break;
            case "fire":
                result.commands[result.commands.length] = parseFire(root,
                        commandElm);
                break;
            case "fireRef":
                result.commands[result.commands.length] = parseFireRef(root,
                        commandElm);
                break;
            case "changeDirection":
                result.commands[result.commands.length] = parseChangeDirection(
                        root, commandElm);
                break;
            case "changeSpeed":
                result.commands[result.commands.length] = parseChangeSpeed(
                        root, commandElm);
                break;
            case "accel":
                result.commands[result.commands.length] = parseAccel(root,
                        commandElm);
                break;
            case "wait":
                result.commands[result.commands.length] = parseWait(root,
                        commandElm);
                break;
            case "vanish":
                result.commands[result.commands.length] = parseVanish(root,
                        commandElm);
                break;
            case "repeat":
                result.commands[result.commands.length] = parseRepeat(root,
                        commandElm);
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
            result.params[result.params.length] = text(param);
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
                result.actions[result.actions.length] = parseAction(root,
                        action);
            } else if (action.tagName == "actionRef") {
                result.actions[result.actions.length] = parseActionRef(root,
                        action);
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
            result.params[result.params.length] = text(param);
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

        if (!result.bullet) {
            throw new Error("fire has no bullet or bulletRef.");
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
            result.params[result.params.length] = text(param);
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
        result.root = root;

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

    // DSL -------------------------------------------------------

    BulletML.dsl = function() {
        for (var func in BulletML.dsl) if (BulletML.dsl.hasOwnProperty(func)) {
            BulletML.global[func] = BulletML.dsl[func];
        }
    };
    BulletML.dsl.action = function(commands) {
        for (var i = 0, end = arguments.length; i < end; i++)
            if (arguments[i] instanceof Function)
                arguments[i] = arguments[i]();

        var result = new BulletML.Action();
        if (commands instanceof Array) {
            if (commands.some(function(c) {
                return !(c instanceof BulletML.Command);
            })) {
                throw new Error("argument type error.");
            }
            result.commands = commands;
        } else {
            for (var i = 0, end = arguments.length; i < end; i++) {
                if (arguments[i] instanceof BulletML.Command) {
                    result.commands[i] = arguments[i];
                } else {
                    throw new Error("argument type error.");
                }
            }
        }
        return result;
    };
    BulletML.dsl.actionRef = function(label, args) {
        for (var i = 0, end = arguments.length; i < end; i++)
            if (arguments[i] instanceof Function)
                arguments[i] = arguments[i]();

        if (label == undefined) throw new Error("label is required.");
        var result = new BulletML.ActionRef();
        result.label = "" + label;
        if (args instanceof Array) {
            result.params = args;
        } else {
            for (var i = 1; i < arguments.length; i++) {
                result.params.push(arguments[i]);
            }
        }
        return result;
    };
    BulletML.dsl.bullet = function(direction, speed, action, label) {
        for (var i = 0, end = arguments.length; i < end; i++)
            if (arguments[i] instanceof Function)
                arguments[i] = arguments[i]();

        var result = new BulletML.Bullet();
        for (var i = 0; i < arguments.length; i++) {
            if (arguments[i] instanceof BulletML.Direction) {
                result.direction = arguments[i];
            } else if (arguments[i] instanceof BulletML.Speed) {
                result.speed = arguments[i];
            } else if (arguments[i] instanceof BulletML.Action) {
                result.actions.push(arguments[i]);
            } else if (arguments[i] instanceof BulletML.ActionRef) {
                result.actions.push(arguments[i]);
            } else if (typeof(arguments[i]) === "string") {
                result.label = arguments[i];
            }
        }
        return result;
    };
    BulletML.dsl.bulletRef = function(label, args) {
        for (var i = 0, end = arguments.length; i < end; i++)
            if (arguments[i] instanceof Function)
                arguments[i] = arguments[i]();

        if (label == undefined) throw new Error("label is required.");
        var result = new BulletML.BulletRef();
        result.label = "" + label;
        if (args instanceof Array) {
            result.params = args;
        } else {
            for (var i = 1; i < arguments.length; i++) {
                result.params.push(arguments[i]);
            }
        }
        return result;
    };
    BulletML.dsl.fire = function(bullet, direction, speed) {
        for (var i = 0, end = arguments.length; i < end; i++)
            if (arguments[i] instanceof Function)
                arguments[i] = arguments[i]();

        var result = new BulletML.Fire();
        for (var i = 0; i < arguments.length; i++) {
            if (arguments[i] instanceof BulletML.Direction) {
                result.direction = arguments[i];
            } else if (arguments[i] instanceof BulletML.Speed) {
                result.speed = arguments[i];
            } else if (arguments[i] instanceof BulletML.Bullet) {
                result.bullet = arguments[i];
            } else if (arguments[i] instanceof BulletML.BulletRef) {
                result.bullet = arguments[i];
            }
        }
        if (result.bullet == undefined)
            throw new Error("bullet (or bulletRef) is required.");
        return result;
    };
    BulletML.dsl.fireRef = function(label, args) {
        for (var i = 0, end = arguments.length; i < end; i++)
            if (arguments[i] instanceof Function)
                arguments[i] = arguments[i]();

        if (label == undefined) throw new Error("label is required.");
        var result = new BulletML.FireRef();
        result.label = "" + label;
        if (args instanceof Array) {
            result.params = args;
        } else {
            for (var i = 1; i < arguments.length; i++) {
                result.params.push(arguments[i]);
            }
        }
        return result;
    };
    BulletML.dsl.changeDirection = function(direction, term) {
        for (var i = 0, end = arguments.length; i < end; i++)
            if (arguments[i] instanceof Function)
                arguments[i] = arguments[i]();

        if (direction == undefined) throw new Error("direction is required.");
        if (term == undefined) throw new Error("term is required.");
        var result = new BulletML.ChangeDirection();
        result.direction = direction;
        result.term = term;
        if (!(result.direction instanceof BulletML.Direction)) {
            throw new Error("argument type error.");
        }
        return result;
    };
    BulletML.dsl.changeSpeed = function(speed, term) {
        for (var i = 0, end = arguments.length; i < end; i++)
            if (arguments[i] instanceof Function)
                arguments[i] = arguments[i]();

        if (speed == undefined) throw new Error("speed is required.");
        if (term == undefined) throw new Error("term is required.");
        var result = new BulletML.ChangeSpeed();
        result.speed = speed;
        result.term = term;
        if (!(result.speed instanceof BulletML.Speed)) {
            throw new Error("argument type error.");
        }
        return result;
    };
    BulletML.dsl.accel = function(horizontal, vertical, term) {
        for (var i = 0, end = arguments.length; i < end; i++)
            if (arguments[i] instanceof Function)
                arguments[i] = arguments[i]();

        var result = new BulletML.Accel();
        for (var i = 0; i < arguments.length; i++) {
            if (arguments[i] instanceof BulletML.Horizontal) {
                result.horizontal = horizontal;
            } else if (arguments[i] instanceof BulletML.Vertical) {
                result.vertical = vertical;
            } else {
                result.term = arguments[i];
            }
        }
        if (result.horizontal == undefined && result.vertical == undefined)
            throw new Error("horizontal or vertical is required.");
        if (result.term == undefined) throw new Error("term is required.");
        return result;
    };
    BulletML.dsl.wait = function(value) {
        for (var i = 0, end = arguments.length; i < end; i++)
            if (arguments[i] instanceof Function)
                arguments[i] = arguments[i]();

        if (value == undefined) throw new Error("value is required.");
        return new BulletML.Wait(value);
    };
    BulletML.dsl.vanish = function() {
        return new BulletML.Vanish();
    };
    BulletML.dsl.repeat = function(times, action) {
        for (var i = 0, end = arguments.length; i < end; i++)
            if (arguments[i] instanceof Function)
                arguments[i] = arguments[i]();

        if (times == undefined) throw new Error("times is required.");
        if (action == undefined) throw new Error("action is required.");
        var result = new BulletML.Repeat();
        result.times = times;
        if (action instanceof BulletML.Action || action instanceof BulletML.ActionRef) {
            result.action = action;
        } else if (action instanceof Array) {
            result.action = BulletML.dsl.action(action);
        }
        return result;
    };
    BulletML.dsl.direction = function(value, type) {
        for (var i = 0, end = arguments.length; i < end; i++)
            if (arguments[i] instanceof Function)
                arguments[i] = arguments[i]();

        if (value == undefined) throw new Error("value is required.");
        var result = new BulletML.Direction(value);
        if (type) result.type = type;
        return result;
    };
    BulletML.dsl.speed = function(value, type) {
        for (var i = 0, end = arguments.length; i < end; i++)
            if (arguments[i] instanceof Function)
                arguments[i] = arguments[i]();

        if (value == undefined) throw new Error("value is required.");
        var result = new BulletML.Speed(value);
        if (type) result.type = type;
        return result;
    };
    BulletML.dsl.horizontal = function(value, type) {
        for (var i = 0, end = arguments.length; i < end; i++)
            if (arguments[i] instanceof Function)
                arguments[i] = arguments[i]();

        if (value == undefined) throw new Error("value is required.");
        var result = new BulletML.Horizontal(value);
        if (type) result.type = type;
        return result;
    };
    BulletML.dsl.vertical = function(value, type) {
        for (var i = 0, end = arguments.length; i < end; i++)
            if (arguments[i] instanceof Function)
                arguments[i] = arguments[i]();

        if (value == undefined) throw new Error("value is required.");
        var result = new BulletML.Vertical(value);
        if (type) result.type = type;
        return result;
    };

    // utility ---------------------------------------------------

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
        var attrs = element.attributes;
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
