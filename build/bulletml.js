/*
 * bulletml.js v0.5.0
 * https://github.com/daishihmr/bulletml.js
 * 
 * The MIT License (MIT)
 * Copyright © 2014 daishi_hmr, dev7.jp
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
 * associated documentation files (the “Software”), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following
 * conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions
 * of the Software.
 * 
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
 
/**
 * @preserve bulletml.js v0.6.0-SNAPSHOT
 *
 * License
 * http://daishihmr.mit-license.org/
 */

/** @namespace */
var bulletml = {};
/** @const */
bulletml.GLOBAL = this;

(function() {
    /**
     * @constructor
     */
    bulletml.Node = function() {};

    /**
     *
     */
    bulletml.Node.prototype.scan = function(func) {
        func(this);
        for (var key in this) if (this.hasOwnProperty(key)) {
            var child = this[key];
            if (child instanceof bulletml.Node) {
                child.scan(func);
            }
        }
    };

    /**
     * bulletmlのルート要素.
     *
     * @constructor
     * @param {Object=} data
     */
    bulletml.Root = function(data) {
        bulletml.Node.call(this);

        /**
         * @type {string}
         */
        this.type = "none";
        /**
         * @type {bulletml.Root}
         */
        this.root = this;
        /**
         * top level action elements.
         *
         * @type {Array.<bulletml.Action>}
         */
        this.actions = [];
        /**
         * top level bullet elements.
         *
         * @type {Array.<bulletml.Bullet>}
         */
        this.bullets = [];
        /**
         * top level fire elements.
         *
         * @type {Array.<bulletml.Fire>}
         */
        this.fires = [];

        if (data !== undefined) {
            for (var prop in data) if (data.hasOwnProperty(prop)) {
                data[prop].label = prop;
                if (data[prop] instanceof bulletml.Action) {
                    this.actions.push(data[prop]);
                } else if (data[prop] instanceof bulletml.Bullet) {
                    this.bullets.push(data[prop]);
                } else if (data[prop] instanceof bulletml.Fire) {
                    this.fires.push(data[prop]);
                }
            }

            for (var i = 0, end = this.actions.length; i < end; i++) {
                this.actions[i].setRoot(this);
            }
            for (var i = 0, end = this.bullets.length; i < end; i++) {
                this.bullets[i].setRoot(this);
            }
            for (var i = 0, end = this.fires.length; i < end; i++) {
                this.fires[i].setRoot(this);
            }
        }
    };

    bulletml.Root.prototype = Object.create(bulletml.Node.prototype);

    /**
     * find top level action element by label.
     *
     * @param {string}
     *            label label attribute value
     * @return {bulletml.Action}
     */
    bulletml.Root.prototype.findAction = function(label) {
        return search(this.actions, label);
    };

    /**
     * find actions label starts with 'top'.
     *
     * @return {Array.<string>}
     */
    bulletml.Root.prototype.getTopActionLabels = function() {
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
     * @return {bulletml.Action}
     */
    bulletml.Root.prototype.findActionOrThrow = function(label) {
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
     * @return {bulletml.Bullet}
     */
    bulletml.Root.prototype.findBullet = function(label) {
        return search(this.bullets, label);
    };

    /**
     * find top level bullet element by label. throw error if bullet is
     * undefined.
     *
     * @param {string}
     *            label label attribute value
     * @return {bulletml.Bullet}
     */
    bulletml.Root.prototype.findBulletOrThrow = function(label) {
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
     * @return {bulletml.Fire}
     */
    bulletml.Root.prototype.findFire = function(label) {
        return search(this.fires, label);
    };

    /**
     * find top level fire element by label. throw error if fire is undefined.
     *
     * @param {string}
     *            label label attribute value
     * @return {bulletml.Fire}
     */
    bulletml.Root.prototype.findFireOrThrow = function(label) {
        var result;
        if (result = this.findFire(label)) {
            return result;
        } else {
            throw new Error("fire labeled '" + label + "' is undefined.");
        }
    };

    /**
     * bullet要素.
     *
     * @constructor
     */
    bulletml.Bullet = function() {
        bulletml.Node.call(this);

        /**
         * @type {?string}
         */
        this.label = null;
        /**
         * @type {bulletml.Root}
         */
        this.root = null;
        /**
         * @type {bulletml.Direction}
         */
        this.direction = new bulletml.Direction(0);
        /**
         * @type {bulletml.Speed}
         */
        this.speed = new bulletml.Speed(1);
        /**
         * @type {Array.<bulletml.Command>}
         */
        this.actions = [];
        /**
         * @type {Object}
         */
        this.option = {};
        this._localScope = {};
    };

    bulletml.Bullet.prototype = Object.create(bulletml.Node.prototype);

    /**
     * @return {bulletml.Bullet}
     */
    bulletml.Bullet.prototype.clone = function(walker) {
        var c = new bulletml.Bullet();
        c.label = this.label;
        c.root = this.root;
        c.actions = this.actions;
        c.direction = new bulletml.Direction(walker._evalParam(this.direction.value));
        c.direction.type = this.direction.type;
        c.speed = new bulletml.Speed(walker._evalParam(this.speed.value));
        c.speed.type = this.speed.type;
        c.option = this.option;
        c._localScope = walker._localScope;
        return c;
    };

    /**
     * @param {bulletml.Root} root
     */
    bulletml.Bullet.prototype.setRoot = function(root) {
        this.root = root;
        for (var i = 0, end = this.actions.length; i < end; i++) {
            this.actions[i].setRoot(root);
        }
    };

    /**
     * @constructor
     * @param {string} label
     */
    bulletml.BulletRef = function(label) {
        bulletml.Node.call(this);

        this.root = null;
        /**
         * @type {string}
         */
        this.label = label;
        /**
         */
        this.params = [];
    };

    bulletml.BulletRef.prototype = Object.create(bulletml.Node.prototype);

    /**
     * @return {bulletml.BulletRef}
     */
    bulletml.BulletRef.prototype.clone = function(walker) {
        var bkup = walker._localScope;
        walker._localScope = walker._newScope(this.params);
        var b = this.root.findBulletOrThrow(this.label).clone(walker);
        walker._localScope = bkup;
        return b;
    };

    /**
     * @param {bulletml.Root} root
     */
    bulletml.BulletRef.prototype.setRoot = function(root) {
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
    bulletml.Command = function() {
        bulletml.Node.call(this);

        /**
         * @type {string}
         */
        this.commandName = "";
    };

    bulletml.Command.prototype = Object.create(bulletml.Node.prototype);

    /**
     * @param {bulletml.Root} root
     */
    bulletml.Command.prototype.setRoot = function(root) {
        this.root = root;
    };

    /**
     * @constructor
     * @extends {bulletml.Command}
     * @augments bulletml.Command
     */
    bulletml.Action = function() {
        bulletml.Command.call(this);

        /**
         * @type {string}
         */
        this.commandName = "action";
        /**
         * @type {?string}
         */
        this.label = null;
        /**
         * @type {bulletml.Root}
         */
        this.root = null;
        /**
         * @type {Array.<bulletml.Command>}
         */
        this.commands = [];
        /**
         * @type {Array.<(string|number)>}
         */
        this.params = [];
    };

    bulletml.Action.prototype = Object.create(bulletml.Command.prototype);

    /** @inheritDoc */
    bulletml.Action.prototype.setRoot = function(root) {
        this.root = root;
        for (var i = 0, end = this.commands.length; i < end; i++) {
            this.commands[i].setRoot(root);
        }
    };

    /** @return {bulletml.Action} */
    bulletml.Action.prototype.clone = function() {
        var c = new bulletml.Action();
        c.label = this.label;
        c.root = this.root;
        c.commands = this.commands;
        return c;
    };

    /**
     * @constructor
     * @extends {bulletml.Command}
     * @augments bulletml.Command
     * @param {string} label
     */
    bulletml.ActionRef = function(label) {
        bulletml.Command.call(this);

        /**
         * @type {string}
         */
        this.commandName = "actionRef";
        /**
         * @type {string}
         */
        this.label = label;
        /**
         * @type {bulletml.Root}
         */
        this.root = null;
        /**
         */
        this.params = [];
    };

    bulletml.ActionRef.prototype = Object.create(bulletml.Command.prototype);

    bulletml.ActionRef.prototype.clone = function() {
        var c = new bulletml.Action();
        c.root = this.root;
        c.commands.push(this);
        return c;
    };

    /**
     * @constructor
     * @extends {bulletml.Command}
     * @augments bulletml.Command
     */
    bulletml.Fire = function() {
        bulletml.Command.call(this);

        /**
         * @type {string}
         */
        this.commandName = "fire";
        /**
         * @type {?string}
         */
        this.label = null;
        /**
         * @type {bulletml.Root}
         */
        this.root = null;
        /**
         * @type {bulletml.Direction}
         */
        this.direction = null;
        /**
         * @type {bulletml.Speed}
         */
        this.speed = null;
        /**
         * @type {(bulletml.Bullet|bulletml.BulletRef)}
         */
        this.bullet = null;
        /**
         * @type {bulletml.FireOption}
         */
        this.option = new bulletml.FireOption();
    };

    bulletml.Fire.prototype = Object.create(bulletml.Command.prototype);

    /** @inheritDoc */
    bulletml.Fire.prototype.setRoot = function(root) {
        this.root = root;
        // console.log("this.bullet = ", this.bullet);
        if (this.bullet) this.bullet.setRoot(root);
    };

    /**
     * @constructor
     * @extends {bulletml.Command}
     * @augments bulletml.Command
     * @param {string} label
     */
    bulletml.FireRef = function(label) {
        bulletml.Command.call(this);

        /**
         * @type {string}
         */
        this.commandName = "fireRef";
        /**
         * @type {string}
         */
        this.label = label;
        /**
         */
        this.params = [];
    };

    bulletml.FireRef.prototype = Object.create(bulletml.Command.prototype);

    /**
     * @constructor
     * @extends {bulletml.Command}
     * @augments bulletml.Command
     */
    bulletml.ChangeDirection = function() {
        bulletml.Command.call(this);

        /**
         * @type {string}
         */
        this.commandName = "changeDirection";
        /**
         */
        this.direction = new bulletml.Direction();
        /**
         */
        this.term = 0;
    };

    bulletml.ChangeDirection.prototype = Object.create(bulletml.Command.prototype);

    /**
     * @constructor
     * @extends {bulletml.Command}
     * @augments bulletml.Command
     */
    bulletml.ChangeSpeed = function() {
        bulletml.Command.call(this);

        /**
         * @type {string}
         */
        this.commandName = "changeSpeed";
        /**
         */
        this.speed = new bulletml.Speed();
        /**
         */
        this.term = 0;
    };

    bulletml.ChangeSpeed.prototype = Object.create(bulletml.Command.prototype);

    /**
     * @constructor
     * @extends {bulletml.Command}
     * @augments bulletml.Command
     */
    bulletml.Accel = function() {
        bulletml.Command.call(this);

        /**
         * @type {string}
         */
        this.commandName = "accel";
        /**
         */
        this.horizontal = new bulletml.Horizontal();
        /**
         */
        this.vertical = new bulletml.Vertical();
        /**
         */
        this.term = 0;
    };

    bulletml.Accel.prototype = Object.create(bulletml.Command.prototype);

    /**
     * @constructor
     * @extends {bulletml.Command}
     * @augments bulletml.Command
     * @param {(number|string)=} value
     */
    bulletml.Wait = function(value) {
        bulletml.Command.call(this);

        /**
         * @type {string}
         */
        this.commandName = "wait";
        /**
         * @type {(number|string)}
         */
        this.value = value || 0;
    };

    bulletml.Wait.prototype = Object.create(bulletml.Command.prototype);

    /**
     * @constructor
     * @extends {bulletml.Command}
     * @augments bulletml.Command
     */
    bulletml.Vanish = function() {
        bulletml.Command.call(this);

        /**
         * @type {string}
         */
        this.commandName = "vanish";
    };
    bulletml.Vanish.prototype = Object.create(bulletml.Command.prototype);

    /**
     * @constructor
     * @extends {bulletml.Command}
     * @augments bulletml.Command
     */
    bulletml.Repeat = function() {
        bulletml.Command.call(this);

        /**
         * @type {string}
         */
        this.commandName = "repeat";
        /**
         * @type {(number|string)}
         */
        this.times = 0;
        /**
         * @type {(bulletml.Action||bulletml.ActionRef)}
         */
        this.action = null;
        /**
         * @type {Array.<(string|number)>}
         */
        this.params = [];
    };

    bulletml.Repeat.prototype = Object.create(bulletml.Command.prototype);

    bulletml.Repeat.prototype.setRoot = function(root) {
        this.root = root;
        if (this.action) this.action.setRoot(root);
    };

    /**
     * @constructor
     * @extends {bulletml.Command}
     * @augments bulletml.Command
     * @param {string} variable
     * @param {(string|number)} expression
     * @since 0.5
     */
    bulletml.Bind = function(variable, expression) {
        bulletml.Command.call(this);

        /**
         * @type {string}
         */
        this.commandName = "bind";
        this.variable = variable;
        this.expression = expression;
    };

    bulletml.Bind.prototype = Object.create(bulletml.Command.prototype);

    /**
     * @constructor
     * @param {string} eventName
     * @param {?Array} params
     * @since 0.5
     */
    bulletml.Notify = function(eventName, params) {
        bulletml.Command.call(this);

        this.commandName = "notify";
        this.eventName = eventName;
        this.params = params || null;
    };

    bulletml.Notify.prototype = Object.create(bulletml.Command.prototype);

    bulletml.DummyCommand = new bulletml.Command();

    // valueクラス -----------------------------------------------

    /**
     * @constructor
     * @param {(number|string)=} value
     */
    bulletml.Direction = function(value) {
        bulletml.Node.call(this);

        /**
         * @type {string}
         */
        this.type = "aim";
        /**
         * @type {(string|number)}
         */
        this.value = value || 0;
    };

    bulletml.Direction.prototype = Object.create(bulletml.Node.prototype);

    /**
     * @constructor
     * @param {(number|string)=} value
     */
    bulletml.Speed = function(value) {
        bulletml.Node.call(this);

        /**
         * @type {string}
         */
        this.type = "absolute";
        /**
         * @type {(string|number)}
         */
        this.value = (value === undefined) ? 1 : value;
    };

    bulletml.Speed.prototype = Object.create(bulletml.Node.prototype);

    /**
     * @constructor
     * @param {(number|string)=} value
     */
    bulletml.Horizontal = function(value) {
        bulletml.Node.call(this);

        /**
         * @type {string}
         */
        this.type = "absolute";
        /**
         * @type {(string|number)}
         */
        this.value = value || 0;
    };

    bulletml.Horizontal.prototype = Object.create(bulletml.Node.prototype);

    /**
     * @constructor
     * @param {(number|string)=} value
     */
    bulletml.Vertical = function(value) {
        bulletml.Node.call(this);

        /**
         * @type {string}
         */
        this.type = "absolute";
        /**
         * @type {(string|number)}
         */
        this.value = value || 0;
    };

    bulletml.Vertical.prototype = Object.create(bulletml.Node.prototype);

    /**
     * @constructor
     * @param {Object=} params
     * @since 0.5
     */
    bulletml.FireOption = function(params) {
        bulletml.Node.call(this);

        params = params || {};

        /**
         * @type {(string|number)}
         */
        this.offsetX = params.offsetX || 0;
        /**
         * @type {(string|number)}
         */
        this.offsetY = params.offsetY || 0;
        /**
         * @type {boolean}
         */
        this.autonomy = true;
        if (params.autonomy !== undefined) {
            this.autonomy = !!params.autonomy;
        }
    };

    bulletml.FireOption.prototype = Object.create(bulletml.Node.prototype);

    /**
     * @constructor
     * @param {number=} value
     * @since 0.5
     */
    bulletml.OffsetX = function(value) {
        bulletml.Node.call(this);

        this.value = value || 0;
    };

    bulletml.OffsetX.prototype = Object.create(bulletml.Node.prototype);

    /**
     * @constructor
     * @param {number=} value
     * @since 0.5
     */
    bulletml.OffsetY = function(value) {
        bulletml.Node.call(this);

        this.value = value || 0;
    };

    bulletml.OffsetY.prototype = Object.create(bulletml.Node.prototype);

    /**
     * @constructor
     * @param {boolean=} value
     * @since 0.5
     */
    bulletml.Autonomy = function(value) {
        bulletml.Node.call(this);

        this.value = !!value;
    };

    bulletml.Autonomy.prototype = Object.create(bulletml.Node.prototype);

    /**
     * @param {Array.<(bulletml.Bullet|bulletml.Action|bulletml.Fire)>} array
     * @param {string} label
     */
    function search(array, label) {
        for ( var i = 0, end = array.length; i < end; i++) {
            if (array[i].label == label) {
                return array[i];
            }
        }
    }

})();

(function() {

    /**
     * @constructor
     * @param {bulletml.Root} root
     */
    bulletml.Walker = function(root) {
        this._root = root;
        /**
         * callstack.
         * @type {Array}
         */
        this._stack = [];
        /**
         * program counter.
         * @type {number}
         */
        this._cursor = -1;
        /**
         * @type {bulletml.Action}
         */
        this._action = null;
        /**
         * current localScope variables.
         * @type {Object.<string,number>}
         */
        this._localScope = {};
    };

    /**
     * @return {bulletml.Command}
     */
    bulletml.Walker.prototype.next = function() {
        this._cursor += 1;
        if (this._action !== null) {
            var n = this._action.commands[this._cursor];

            if (n !== undefined) {
                // console.log(n.commandName, n.label, this._localScope);
                if (n instanceof bulletml.Action) {
                    this._pushStack();
                    this._action = n;
                    this._localScope = this._cloneScope();
                    return this.next();
                } else if (n instanceof bulletml.ActionRef) {
                    this._pushStack();
                    this._action = this._root.findActionOrThrow(n.label);
                    this._localScope = this._newScope(n.params);
                    return this.next();
                } else if (n instanceof bulletml.Repeat) {
                    this._localScope.loopCounter = 0;
                    this._localScope.loopEnd = this._evalParam(n.times);
                    this._pushStack();
                    this._action = n.action.clone();
                    this._localScope = this._cloneScope();
                    return this.next();
                } else if (n instanceof bulletml.Fire) {
                    var f = new bulletml.Fire();
                    f.bullet = n.bullet.clone(this);
                    if (n.direction !== null) {
                        f.direction = new bulletml.Direction(this._evalParam(n.direction.value));
                        f.direction.type = n.direction.type;
                    }
                    if (n.speed !== null) {
                        f.speed = new bulletml.Speed(this._evalParam(n.speed.value));
                        f.speed.type = n.speed.type;
                    }
                    f.option = new bulletml.FireOption();
                    f.option.offsetX = this._evalParam(n.option.offsetX);
                    f.option.offsetY = this._evalParam(n.option.offsetY);
                    f.option.autonomy = n.option.autonomy;
                    return f;
                } else if (n instanceof bulletml.FireRef) {
                    this._pushStack();
                    this._action = new bulletml.Action();
                    this._action.commands = [ this._root.findFireOrThrow(n.label) ];
                    this._localScope = this._newScope(n.params);
                    return this.next();
                } else if (n instanceof bulletml.ChangeDirection) {
                    var cd = new bulletml.ChangeDirection();
                    cd.direction.type = n.direction.type;
                    cd.direction.value = this._evalParam(n.direction.value);
                    cd.term = this._evalParam(n.term);
                    return cd;
                } else if (n instanceof bulletml.ChangeSpeed) {
                    var cs = new bulletml.ChangeSpeed();
                    cs.speed.type = n.speed.type;
                    cs.speed.value = this._evalParam(n.speed.value);
                    cs.term = this._evalParam(n.term);
                    return cs;
                } else if (n instanceof bulletml.Accel) {
                    var a = new bulletml.Accel();
                    a.horizontal.type = n.horizontal.type;
                    a.horizontal.value = this._evalParam(n.horizontal.value);
                    a.vertical.type = n.vertical.type;
                    a.vertical.value = this._evalParam(n.vertical.value);
                    a.term = this._evalParam(n.term);
                    return a;
                } else if (n instanceof bulletml.Wait) {
                    return new bulletml.Wait(this._evalParam(n.value));
                } else if (n instanceof bulletml.Vanish) {
                    return n;
                } else if (n instanceof bulletml.Bind) {
                    // console.log("bind " + n.variable + " <- " + n.expression);
                    this._localScope["$" + n.variable] = this._evalParam(n.expression);
                    // console.log("    = " + this._localScope["$" + n.variable]);
                    return bulletml.DummyCommand;
                } else if (n instanceof bulletml.Notify) {
                    return n;
                } else {
                    return null;
                }
            } else {
                this._popStack();
                if (this._action === null) {
                    return null;
                }
                n = this._action.commands[this._cursor];
                if (n && n.commandName == "repeat") {
                    this._localScope.loopCounter++;
                    if (this._localScope.loopCounter < this._localScope.loopEnd) {
                        this._pushStack();
                        this._action = n.action.clone();
                        this._localScope = this._cloneScope();
                        return this.next();
                    } else {
                        return this.next();
                    }
                } else {
                    return this.next();
                }
            }
        } else {
            return null;
        }
    };

    bulletml.Walker.prototype._pushStack = function() {
        // console.log("_pushStack");
        this._stack.push({
            action : this._action,
            cursor : this._cursor,
            scope : this._localScope
        });
        this._cursor = -1;
    };

    bulletml.Walker.prototype._popStack = function() {
        // console.log("_popStack");
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
    /**
     * @param {(number|string)} exp
     * @return {number}
     */
    bulletml.Walker.prototype._evalParam = function(exp) {
        // console.log("eval(" + exp + ")", this._localScope);
        // evalを使わずに済む場合
        var n;
        if (typeof exp === "boolean") {
            return exp ? 1 : 0;
        } else if (typeof exp === "number") {
            return exp;
        } else if (!isNaN(n = Number(exp))) {
            return n;
        } else if (n = this._localScope[exp]) {
            return n;
        } else if (n = bulletml.Walker.globalScope[exp]) {
            return n;
        } else if (exp === "$rand") {
            return Math.random();
        }

        var scope = {};
        for ( var prop in bulletml.Walker.globalScope) {
            if (bulletml.Walker.globalScope.hasOwnProperty(prop)) {
                scope[prop] = bulletml.Walker.globalScope[prop];
            }
        }
        for ( var prop in this._localScope) {
            if (this._localScope.hasOwnProperty(prop)) {
                scope[prop] = this._localScope[prop];
            }
        }
        scope["$rand"] = Math.random();
        var upperScope = this._stack[this._stack.length - 1];
        if (upperScope) {
            scope["$loop"] = {
                "index": upperScope.scope.loopCounter,
                "count": upperScope.scope.loopCounter + 1,
                "first": upperScope.scope.loopCounter === 0,
                "last": (upperScope.scope.loopCounter + 1) >= upperScope.scope.loopEnd,
            };
        }
        // console.log(scope);
        var f = new Function("return " + exp.split("$").join("this.$"));
        // console.log(f);
        var result = f.apply(scope);
        // console.log(result);
        return result;
    };

    bulletml.Walker.prototype._newScope = function(params) {
        var result = {};
        if (params) {
            for ( var i = 0, end = params.length; i < end; i++) {
                result["$" + (i + 1)] = this._evalParam(params[i]);
            }
        } else {
            for ( var prop in this._localScope)
                if (this._localScope.hasOwnProperty(prop)) {
                    result[prop] = this._localScope[prop];
                }
        }
        return result;
    };

    bulletml.Walker.prototype._cloneScope = function() {
        var result = {};
        for ( var prop in this._localScope)
            if (this._localScope.hasOwnProperty(prop)) {
                result[prop] = this._localScope[prop];
            }
        return result;
    };


    /**
     * @return {bulletml.Walker}
     */
    bulletml.Root.prototype.getWalker = function(actionLabel) {
        var w = new bulletml.Walker(this);
        var action = this.findAction(actionLabel);
        if (action) {
            w._action = action;
        }
        return w;
    };

    /**
     * @return {bulletml.Walker}
     */
    bulletml.Bullet.prototype.getWalker = function() {
        var w = new bulletml.Walker(this.root);
        var action = new bulletml.Action();
        action.root = this.root;
        action.commands = this.actions;
        w._action = action;
        w._localScope = this._localScope;
        return w;
    };

    bulletml.Walker.globalScope = {};

})();

(function() {

    /**
     * BulletMLを解析し、JavaScriptオブジェクトツリーを生成する.
     *
     * @param {(string|Document|Object)} data 弾幕定義
     * @return {bulletml.Root}
     */
    bulletml.buildXML = function(data) {
        var result;
        if (typeof data === "string") {
            var domParser = new DOMParser();
            result = parse(domParser.parseFromString(data, "application/xml"));
        } else if (data.getElementsByTagName("bulletml")) {
            result = parse(data);
        } else {
            throw new Error("cannot build " + data);
        }
        return result;
    };

    function parse(element) {
        var result = new bulletml.Root();

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
                if (actions[i].parentNode !== root) continue;
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
                if (bullets[i].parentNode !== root) continue;
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
                if (fires[i].parentNode !== root) continue;
                var newFire = parseFire(result, fires[i]);
                if (newFire) {
                    result.fires[result.fires.length] = newFire;
                }
            }
        }

        return result;
    }

    function parseAction(root, element) {
        var result = new bulletml.Action();
        attr(element, "label", function(label) {
            result.label = label;
        });
        each(element, ".", function(commandElm) {
            switch (commandElm.tagName.toLowerCase()) {
            case "action":
                result.commands[result.commands.length] = parseAction(root, commandElm);
                break;
            case "actionref":
                result.commands[result.commands.length] = parseActionRef(root, commandElm);
                break;
            case "fire":
                result.commands[result.commands.length] = parseFire(root, commandElm);
                break;
            case "fireref":
                result.commands[result.commands.length] = parseFireRef(root, commandElm);
                break;
            case "changedirection":
                result.commands[result.commands.length] = parseChangeDirection(root, commandElm);
                break;
            case "changespeed":
                result.commands[result.commands.length] = parseChangeSpeed(root, commandElm);
                break;
            case "accel":
                result.commands[result.commands.length] = parseAccel(root, commandElm);
                break;
            case "wait":
                result.commands[result.commands.length] = parseWait(root, commandElm);
                break;
            case "vanish":
                result.commands[result.commands.length] = parseVanish(root, commandElm);
                break;
            case "repeat":
                result.commands[result.commands.length] = parseRepeat(root, commandElm);
                break;
            }
        });

        result.root = root;
        return result;
    }

    function parseActionRef(root, element) {
        var result = new bulletml.ActionRef(attr(element, "label"));

        each(element, /param$/, function(param) {
            result.params[result.params.length] = text(param);
        });
        result.root = root;

        return result;
    }

    function parseBullet(root, element) {
        var result = new bulletml.Bullet();

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
            if (action.tagName.toLowerCase() == "action") {
                result.actions[result.actions.length] = parseAction(root,
                        action);
            } else if (action.tagName.toLowerCase() == "actionref") {
                result.actions[result.actions.length] = parseActionRef(root,
                        action);
            }
        });
        result.root = root;

        return result;
    }

    function parseBulletRef(root, element) {
        var result = new bulletml.BulletRef(attr(element, "label"));

        each(element, /param$/, function(param) {
            result.params[result.params.length] = text(param);
        });
        result.root = root;

        return result;
    }

    function parseFire(root, element) {
        var result = new bulletml.Fire();

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
        get(element, "bulletref", function(bulletRef) {
            result.bullet = parseBulletRef(root, bulletRef);
        });

        if (!result.bullet) {
            throw new Error("fire has no bullet or bulletRef.");
        }

        result.root = root;
        return result;
    }

    function parseFireRef(root, element) {
        var result = new bulletml.FireRef(attr(element, "label"));

        each(element, /param$/, function(param) {
            result.params[result.params.length] = text(param);
        });
        result.root = root;

        return result;
    }

    function parseChangeDirection(root, element) {
        var result = new bulletml.ChangeDirection();
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
        var result = new bulletml.ChangeSpeed();
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
        var result = new bulletml.Accel();
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
        var result = new bulletml.Wait();
        result.root = root;

        result.value = text(element);

        return result;
    }

    function parseVanish(root, element) {
        var result = new bulletml.Vanish();
        result.root = root;
        return result;
    }

    function parseRepeat(root, element) {
        var result = new bulletml.Repeat();

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
        return setTypeAndValue(new bulletml.Direction(), element);
    }

    function parseSpeed(element) {
        return setTypeAndValue(new bulletml.Speed(), element);
    }

    function parseHorizontal(element) {
        return setTypeAndValue(new bulletml.Horizontal(), element);
    }

    function parseVertical(element) {
        return setTypeAndValue(new bulletml.Vertical(), element);
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

    /**
     * @param {Element} element
     * @param {string} tagName
     * @param {function(Element)=} callback
     * @param {function()=} ifNotFound
     * @return {Element}
     */
    function get(element, tagName, callback, ifNotFound) {
        tagName = tagName.toLowerCase();
        var children = element.childNodes;
        for ( var i = 0, end = children.length; i < end; i++) {
            if (children[i].tagName && children[i].tagName.toLowerCase() == tagName) {
                if (callback) {
                    callback(children[i]);
                }
                return children[i];
            }
        }
        if (ifNotFound) {
            ifNotFound();
        }
        return null;
    }

    /**
     * @param {Element} element
     * @param {(string|RegExp)} filter
     * @param {function(Element)} callback
     */
    function each(element, filter, callback) {
        var children = element.childNodes;
        for ( var i = 0, end = children.length; i < end; i++) {
            if (children[i].tagName && children[i].tagName.toLowerCase().match(filter)) {
                callback(children[i]);
            }
        }
    }
    /**
     * @param {Element} element
     * @param {string} attrName
     * @param {function(string)=} callback
     * @param {function()=} ifNotFound
     * @return {string}
     */
    function attr(element, attrName, callback, ifNotFound) {
        var attrs = element.attributes;
        var attr = attrs[attrName];
        if (attr) {
            if (callback) {
                callback(attr.value);
            }
            return attr.value;
        } else if (ifNotFound) {
            ifNotFound();
        }
        return "";
    }

    /**
     * @param {Element} element
     * @param {function(string)=} callback
     * @return {string}
     */
    function text(element, callback) {
        var result = element.textContent.trim();
        if (result !== undefined) {
            if (callback) {
                callback(result);
            }
            return result;
        }
        return "";
    }

})();

(function() {

    /**
     * @namespace
     * @param {string} prefix
     */
    bulletml.dsl = function(prefix) {
        prefix = prefix || "";
        for (var func in bulletml.dsl) if (bulletml.dsl.hasOwnProperty(func)) {
            bulletml.GLOBAL[prefix + func] = bulletml.dsl[func];
        }
    };

    /**
     * Action要素を作る.
     *
     * @param {...(bulletml.Command|Array.<bulletml.Command>)} commands
     * <ol>
     *   <li>1個または複数のCommand（可変長引数）.
     *   <li>Commandの配列.
     * </ol>
     * @return {bulletml.Action}
     */
    bulletml.dsl.action = function(commands) {
        if (arguments.length > 0) {
            for (var i = 0, end = arguments.length; i < end; i++) {
                if (arguments[i] instanceof Function) {
                    arguments[i] = arguments[i]();
                }
            }
        }
        if (commands instanceof Array) {
            for (var i = 0, end = commands.length; i < end; i++) {
                if (commands[i] instanceof Function) {
                    commands[i] = commands[i]();
                }
            }
        }

        var result = new bulletml.Action();
        if (commands instanceof Array) {
            if (commands.some(function(c) {
                return !(c instanceof bulletml.Command);
            })) {
                throw new Error("argument type error.");
            }
            result.commands = commands;
        } else {
            for (var i = 0, end = arguments.length; i < end; i++) {
                if (arguments[i] instanceof bulletml.Command) {
                    result.commands[i] = arguments[i];
                } else {
                    throw new Error("argument type error.");
                }
            }
        }
        return result;
    };

    /**
     * @param {string} label
     * @return {bulletml.ActionRef}
     */
    bulletml.dsl.actionRef = function(label, args) {
        for (var i = 0, end = arguments.length; i < end; i++) {
            if (arguments[i] instanceof Function) {
                arguments[i] = arguments[i]();
            }
        }

        if (label === undefined) throw new Error("label is required.");
        var result = new bulletml.ActionRef(label);
        if (args instanceof Array) {
            result.params = args;
        } else {
            for (var i = 1; i < arguments.length; i++) {
                result.params.push(arguments[i]);
            }
        }
        return result;
    };

    /**
     * @param {string} label
     * @return {bulletml.Bullet}
     */     
    bulletml.dsl.bullet = function(direction, speed, action, label) {
        for (var i = 0, end = arguments.length; i < end; i++) {
            if (arguments[i] instanceof Function) {
                arguments[i] = arguments[i]();
            }
        }

        var result = new bulletml.Bullet();
        for (var i = 0; i < arguments.length; i++) {
            if (arguments[i] instanceof bulletml.Direction) {
                result.direction = arguments[i];
            } else if (arguments[i] instanceof bulletml.Speed) {
                result.speed = arguments[i];
            } else if (arguments[i] instanceof bulletml.Action) {
                result.actions.push(arguments[i]);
            } else if (arguments[i] instanceof bulletml.ActionRef) {
                result.actions.push(arguments[i]);
            } else if (arguments[i] instanceof Array) {
                result.actions.push(bulletml.dsl.action(arguments[i]));
            } else if (arguments[i] instanceof Object) {
                result.option = arguments[i];
            } else if (typeof(arguments[i]) === "string") {
                result.label = arguments[i];
            }
        }
        return result;
    };

    /**
     * @param {string} label
     * @return {bulletml.BulletRef}
     */     
    bulletml.dsl.bulletRef = function(label, args) {
        for (var i = 0, end = arguments.length; i < end; i++) {
            if (arguments[i] instanceof Function) {
                arguments[i] = arguments[i]();
            }
        }

        if (label === undefined) throw new Error("label is required.");
        var result = new bulletml.BulletRef(label);
        if (args instanceof Array) {
            result.params = args;
        } else {
            for (var i = 1; i < arguments.length; i++) {
                result.params.push(arguments[i]);
            }
        }
        return result;
    };

    /**
     * @return {bulletml.Fire}
     */     
    bulletml.dsl.fire = function(bullet, direction, speed, fireOption) {
        for (var i = 0, end = arguments.length; i < end; i++) {
            if (arguments[i] instanceof Function) {
                arguments[i] = arguments[i]();
            }
        }

        var result = new bulletml.Fire();
        for (var i = 0; i < arguments.length; i++) {
            if (arguments[i] instanceof bulletml.Direction) {
                result.direction = arguments[i];
            } else if (arguments[i] instanceof bulletml.Speed) {
                result.speed = arguments[i];
            } else if (arguments[i] instanceof bulletml.Bullet) {
                result.bullet = arguments[i];
            } else if (arguments[i] instanceof bulletml.BulletRef) {
                result.bullet = arguments[i];
            } else if (arguments[i] instanceof bulletml.FireOption) {
                result.option = arguments[i];
            } else if (arguments[i] instanceof bulletml.OffsetX) {
                result.option.offsetX = arguments[i].value;
            } else if (arguments[i] instanceof bulletml.OffsetY) {
                result.option.offsetY = arguments[i].value;
            } else if (arguments[i] instanceof bulletml.Autonomy) {
                result.option.autonomy = arguments[i].value;
            }
        }
        if (result.bullet === undefined)
            throw new Error("bullet (or bulletRef) is required.");
        return result;
    };

    /**
     * @param {string} label
     * @return {bulletml.FireRef}
     */     
    bulletml.dsl.fireRef = function(label, args) {
        for (var i = 0, end = arguments.length; i < end; i++) {
            if (arguments[i] instanceof Function) {
                arguments[i] = arguments[i]();
            }
        }

        if (label === undefined) throw new Error("label is required.");
        var result = new bulletml.FireRef(label);
        if (args instanceof Array) {
            result.params = args;
        } else {
            for (var i = 1; i < arguments.length; i++) {
                result.params.push(arguments[i]);
            }
        }
        return result;
    };

    /**
     * @return {bulletml.ChangeDirection}
     */     
    bulletml.dsl.changeDirection = function(direction, term) {
        for (var i = 0, end = arguments.length; i < end; i++) {
            if (arguments[i] instanceof Function) {
                arguments[i] = arguments[i]();
            }
        }

        if (direction === undefined) throw new Error("direction is required.");
        if (term === undefined) throw new Error("term is required.");
        var result = new bulletml.ChangeDirection();
        if (direction instanceof bulletml.Direction) {
            result.direction = direction;
        } else {
            result.direction = new bulletml.Direction(direction);
        }
        result.term = term;
        return result;
    };

    /**
     * @return {bulletml.ChangeSpeed}
     */     
    bulletml.dsl.changeSpeed = function(speed, term) {
        for (var i = 0, end = arguments.length; i < end; i++) {
            if (arguments[i] instanceof Function) {
                arguments[i] = arguments[i]();
            }
        }

        if (speed === undefined) throw new Error("speed is required.");
        if (term === undefined) throw new Error("term is required.");
        var result = new bulletml.ChangeSpeed();
        if (speed instanceof bulletml.Speed) {
            result.speed = speed;
        } else {
            result.speed = new bulletml.Speed(speed);
        }
        result.term = term;
        return result;
    };

    /**
     * @return {bulletml.Accel}
     */     
    bulletml.dsl.accel = function(horizontal, vertical, term) {
        for (var i = 0, end = arguments.length; i < end; i++) {
            if (arguments[i] instanceof Function) {
                arguments[i] = arguments[i]();
            }
        }

        var result = new bulletml.Accel();
        for (var i = 0; i < arguments.length; i++) {
            if (arguments[i] instanceof bulletml.Horizontal) {
                result.horizontal = horizontal;
            } else if (arguments[i] instanceof bulletml.Vertical) {
                result.vertical = vertical;
            } else {
                result.term = arguments[i];
            }
        }
        if (result.horizontal === undefined && result.vertical === undefined)
            throw new Error("horizontal or vertical is required.");
        if (result.term === undefined) throw new Error("term is required.");
        return result;
    };

    /**
     * @return {bulletml.Wait}
     */     
    bulletml.dsl.wait = function(value) {
        for (var i = 0, end = arguments.length; i < end; i++) {
            if (arguments[i] instanceof Function) {
                arguments[i] = arguments[i]();
            }
        }

        if (value === undefined) throw new Error("value is required.");
        return new bulletml.Wait(value);
    };

    /**
     * @return {bulletml.Vanish}
     */     
    bulletml.dsl.vanish = function() {
        return new bulletml.Vanish();
    };

    /**
     * @return {bulletml.Repeat}
     */
    bulletml.dsl.repeat = function(times, action) {
        for (var i = 0, end = arguments.length; i < end; i++) {
            if (arguments[i] instanceof Function) {
                arguments[i] = arguments[i]();
            }
        }

        if (times === undefined) throw new Error("times is required.");
        if (action === undefined) throw new Error("action is required.");
        var result = new bulletml.Repeat();
        result.times = times;
        if (action instanceof bulletml.Action || action instanceof bulletml.ActionRef) {
            result.action = action;
        } else if (action instanceof Array) {
            result.action = bulletml.dsl.action(action);
        } else {
            var commands = [];
            for (var i = 1; i < arguments.length; i++) {
                commands.push(arguments[i]);
            }
            result.action = bulletml.dsl.action(commands);
        }
        return result;
    };

    /**
     * @param {string} variable
     * @param {(string|number)} expression
     * @return {bulletml.Bind}
     * @since 0.5
     */
    bulletml.dsl.bindVar = function(variable, expression) {
        return new bulletml.Bind(variable, expression);
    };

    /**
     * @return {bulletml.Notify}
     * @since 0.5
     */
    bulletml.dsl.notify = function(eventName, params) {
        return new bulletml.Notify(eventName, params);
    };

    /**
     * @return {bulletml.Direction}
     */
    bulletml.dsl.direction = function(value, type) {
        for (var i = 0, end = arguments.length; i < end; i++) {
            if (arguments[i] instanceof Function) {
                arguments[i] = arguments[i]();
            }
        }

        if (value === undefined) throw new Error("value is required.");
        var result = new bulletml.Direction(value);
        if (type !== undefined) result.type = type;
        return result;
    };

    /**
     * @return {bulletml.Speed}
     */
    bulletml.dsl.speed = function(value, type) {
        for (var i = 0, end = arguments.length; i < end; i++) {
            if (arguments[i] instanceof Function) {
                arguments[i] = arguments[i]();
            }
        }

        if (value === undefined) throw new Error("value is required.");
        var result = new bulletml.Speed(value);
        if (type) result.type = type;
        return result;
    };

    /**
     * @return {bulletml.Horizontal}
     */
    bulletml.dsl.horizontal = function(value, type) {
        for (var i = 0, end = arguments.length; i < end; i++) {
            if (arguments[i] instanceof Function) {
                arguments[i] = arguments[i]();
            }
        }

        if (value === undefined) throw new Error("value is required.");
        var result = new bulletml.Horizontal(value);
        if (type) result.type = type;
        return result;
    };

    /**
     * @return {bulletml.Vertical}
     */
    bulletml.dsl.vertical = function(value, type) {
        for (var i = 0, end = arguments.length; i < end; i++) {
            if (arguments[i] instanceof Function) {
                arguments[i] = arguments[i]();
            }
        }

        if (value === undefined) throw new Error("value is required.");
        var result = new bulletml.Vertical(value);
        if (type) result.type = type;
        return result;
    };

    /**
     * @param {Object.<string,*>} params
     * @return {bulletml.FireOption}
     * @since 0.5
     */
    bulletml.dsl.fireOption = function(params) {
        return new bulletml.FireOption(params);
    };

    /**
     * @param {number} x
     * @return {bulletml.OffsetX}
     * @since 0.5
     */
    bulletml.dsl.offsetX = function(x) {
        return new bulletml.OffsetX(x);
    };

    /**
     * @param {number} y
     * @return {bulletml.OffsetY}
     * @since 0.5
     */
    bulletml.dsl.offsetY = function(y) {
        return new bulletml.OffsetY(y);
    };

    /**
     * @param {boolean} autonomy
     * @return {bulletml.Autonomy}
     * @since 0.5
     */
    bulletml.dsl.autonomy = function(autonomy) {
        return new bulletml.Autonomy(autonomy);
    };

})();

(function() {

/** @namespace */
bulletml.json = bulletml.json || {};

var classForName = function(name) {
    switch (name) {
        case "bulletml.Root": return bulletml.Root;
        case "bulletml.Bullet": return bulletml.Bullet;
        case "bulletml.BulletRef": return bulletml.BulletRef;
        case "bulletml.Action": return bulletml.Action;
        case "bulletml.ActionRef": return bulletml.ActionRef;
        case "bulletml.Fire": return bulletml.Fire;
        case "bulletml.FireRef": return bulletml.FireRef;
        case "bulletml.ChangeDirection": return bulletml.ChangeDirection;
        case "bulletml.ChangeSpeed": return bulletml.ChangeSpeed;
        case "bulletml.Accel": return bulletml.Accel;
        case "bulletml.Wait": return bulletml.Wait;
        case "bulletml.Vanish": return bulletml.Vanish;
        case "bulletml.Repeat": return bulletml.Repeat;
        case "bulletml.Bind": return bulletml.Bind;
        case "bulletml.Notify": return bulletml.Notify;
        case "bulletml.Direction": return bulletml.Direction;
        case "bulletml.Speed": return bulletml.Speed;
        case "bulletml.Horizontal": return bulletml.Horizontal;
        case "bulletml.Vertical": return bulletml.Vertical;
        case "bulletml.FireOption": return bulletml.FireOption;
        case "bulletml.OffsetX": return bulletml.OffsetX;
        case "bulletml.OffsetY": return bulletml.OffsetY;
        case "bulletml.Autonomy": return bulletml.Autonomy;
        default:
            throw new Error("invalid type: " + name);
    };
};

var sample = {
    actions: [
        {
            type: "Action",
            label: "top",
            commands: [
                {
                    type: "Fire",
                    bullet: {
                        type: "Bullet"
                    },
                    direction: {
                        
                    }
                }
            ]
        }
    ],
    bullets: [
    ],
    fires: [
    ],
};



})();

(function() {

/** @namespace */
bulletml.runner = bulletml.runner || {};

/**
 * @constructor
 * @param {bulletml.Root} root
 */
bulletml.runner.RunnerFactory = function(root) {
    this.root = root;
};

/**
 * @param {Object} config
 * @return {bulletml.runner.Runner}
 */
bulletml.runner.RunnerFactory.prototype.create = function(config) {
    for (var key in bulletml.runner.DEFAULT_CONFIG) if (bulletml.runner.DEFAULT_CONFIG.hasOwnProperty(key)) {
        if (config[key] === undefined) {
            config[key] = bulletml.runner.DEFAULT_CONFIG[key]
        }
    }

    var topLabels = this.root.getTopActionLabels();
    if (topLabels.length === 1) {
        return new bulletml.runner.SubRunner(
            config,
            this.root.getWalker(topLabels[0])
        );
    } else {
        var parentRunner = new bulletml.runner.ParentRunner();
        for (var i = 0, end = topLabels.length; i < end; i++) {
            parentRunner.addSubRunner(new bulletml.runner.SubRunner(
                config,
                this.root.getWalker(topLabels[i])
            ));
        }
        return parentRunner;
    }
};

/**
 * @param {Object} config
 * @param {function(bulletml.runner.Runner)=} callback
 * @return {bulletml.runner.Runner}
 */
bulletml.Root.prototype.createRunner = function(config, callback) {
    var runner = new bulletml.runner.RunnerFactory(this).create(config);
    if (callback) callback(runner);

    return runner;
};

bulletml.runner.DEFAULT_CONFIG = {
    /** @type {number} */
    rank: 0,
    /** @type {?{x: number, y: number}} */
    target: null,
    /** @type {function(bulletml.runner.Runner,Object)} */
    createNewBullet: function(runner, spec) {},
    /** @type {number} */
    speedRate: 1.0,
};

/**
 * @constructor
 */
bulletml.runner.Runner = function() {
    this.x = 0;
    this.y = 0;
};
bulletml.runner.Runner.prototype = {
    constructor: bulletml.runner.Runner,
    update: function() {},
    onVanish: function() {},
    /**
     * @param {string} eventName
     * @param {Object} params
     */
    onNotify: function(eventName, params) {},
};

/**
 * @constructor
 * @extends {bulletml.runner.Runner}
 */
bulletml.runner.ParentRunner = function() {
    bulletml.runner.Runner.call(this);

    this.completed = false;
    this.completedChildCount = 0;
    /**
     * @type {Array.<bulletml.runner.SubRunner>}
     */
    this.subRunners = [];
};
bulletml.runner.ParentRunner.prototype = Object.create(bulletml.runner.Runner.prototype);

/**
 * @param {bulletml.runner.SubRunner} subRunner
 */
bulletml.runner.ParentRunner.prototype.addSubRunner = function(subRunner) {
    subRunner.parentRunner = this;
    this.subRunners.push(subRunner);
};

/**
 * @override
 */
bulletml.runner.ParentRunner.prototype.update = function() {
    for (var i = this.subRunners.length; i--;) {
        this.subRunners[i].x = this.x;
        this.subRunners[i].y = this.y;
        this.subRunners[i].update();
    }
    if (this.completedChildCount === this.subRunners.length) {
        this.completed = true;
    }
};

/**
 * @constructor
 * @extends {bulletml.runner.Runner}
 * @param {Object} config
 */
bulletml.runner.SimpleSubRunner = function(config) {
    bulletml.runner.Runner.call(this);

    this.config = config;

    this.direction = 0.0;
    this.speed = 0.0;

    this.deltaX = null;
    this.deltaY = null;
};
bulletml.runner.SimpleSubRunner.prototype = Object.create(bulletml.runner.Runner.prototype);

/**
 * @override
 */
bulletml.runner.SimpleSubRunner.prototype.update = function() {
    if (this.deltaX === null) this.deltaX = Math.cos(this.direction) * this.speed;
    if (this.deltaY === null) this.deltaY = Math.sin(this.direction) * this.speed;

    this.x += this.deltaX * this.config.speedRate;
    this.y += this.deltaY * this.config.speedRate;
};

/**
 * @constructor
 * @extends {bulletml.runner.SimpleSubRunner}
 * @param {Object} config
 * @param {bulletml.Walker} walker
 */
bulletml.runner.SubRunner = function(config, walker) {
    bulletml.runner.SimpleSubRunner.call(this, config);

    this.walker = walker;

    this.waitTo = -1;

    this.lastDirection = 0.0;
    this.lastSpeed = 0.0;
    this.speedH = 0.0;
    this.speedV = 0.0;
    this.dirIncr = 0.0;
    this.dirFin = 0.0;
    this.chDirEnd = -1.0;
    this.spdIncr = 0.0;
    this.spdFin = 0.0;
    this.chSpdEnd = -1.0;
    this.aclIncrH = 0.0;
    this.aclFinH = 0.0;
    this.aclIncrV = 0.0;
    this.aclFinV = 0.0;
    this.aclEnd = -1.0;
    this.age = -1.0;
    this.stop = false;

    /**
     * @private
     * @type {?bulletml.runner.ParentRunner}
     */
    this.parentRunner = null;
};
bulletml.runner.SubRunner.prototype = Object.create(bulletml.runner.SimpleSubRunner.prototype);

/**
 * @override
 */
bulletml.runner.SubRunner.prototype.update = function() {
    if (this.stop) return;

    this.age += 1;

    var conf = this.config;

    // update direction
    if (this.age < this.chDirEnd) {
        this.direction += this.dirIncr;
    } else if (this.age === this.chDirEnd) {
        this.direction = this.dirFin;
    }

    // update speed
    if (this.age < this.chSpdEnd) {
        this.speed += this.spdIncr;
    } else if (this.age === this.chSpdEnd) {
        this.speed = this.spdFin;
    }

    // update accel
    if (this.age < this.aclEnd) {
        this.speedH += this.aclIncrH;
        this.speedV += this.aclIncrV;
    } else if (this.age === this.aclEnd) {
        this.speedH = this.aclFinH;
        this.speedV = this.aclFinV;
    }

    // move
    this.x += Math.cos(this.direction) * this.speed * conf.speedRate;
    this.y += Math.sin(this.direction) * this.speed * conf.speedRate;
    this.x += this.speedH * conf.speedRate;
    this.y += this.speedV * conf.speedRate;

    // proccess walker
    if (this.age < this.waitTo || this.completed) {
        return;
    }
    var cmd;
    while (cmd = this.walker.next()) {
        switch (cmd.commandName) {
        case "fire":
            this.fire(/**@type{bulletml.Fire}*/(cmd));
            break;
        case "wait":
            this.waitTo = this.age + cmd.value;
            return;
        case "changeDirection":
            this.changeDirection(/**@type{bulletml.ChangeDirection}*/(cmd));
            break;
        case "changeSpeed":
            this.changeSpeed(/**@type{bulletml.ChangeSpeed}*/(cmd));
            break;
        case "accel":
            this.accel(/**@type{bulletml.Accel}*/(cmd));
            break;
        case "vanish":
            this.onVanish();
            break;
        case "notify":
            this.notify(/**@type{bulletml.Notify}*/(cmd));
            break;
        }
    }

    // complete
    this.completed = true;
    if (this.parentRunner !== null) {
        this.parentRunner.completedChildCount += 1;
    }
};

/**
 * @private
 * @param {bulletml.Fire} cmd
 */
bulletml.runner.SubRunner.prototype.fire = function(cmd) {

    var bulletRunner;
    if (cmd.bullet.actions.length === 0) {
        bulletRunner = new bulletml.runner.SimpleSubRunner(this.config);
    } else {
        bulletRunner = new bulletml.runner.SubRunner(this.config, cmd.bullet.getWalker());
    }

    var gunPosition = {
        x: this.x + /**@type{number}*/(cmd.option.offsetX),
        y: this.y + /**@type{number}*/(cmd.option.offsetY)
    };

    // direction
    var d = cmd.direction || cmd.bullet.direction;
    var dv = d.value * Math.PI / 180;
    switch(d.type) {
    case "aim":
        var target = this.config.target;
        if (target) {
            if (target instanceof Function) target = target();
            if (cmd.option.autonomy) {
                bulletRunner.direction = angleAtoB(gunPosition, target) + dv;
            } else {
                bulletRunner.direction = angleAtoB(this, target) + dv;
            }
        } else {
            bulletRunner.direction = dv - Math.PI / 2;
        }
        break;
    case "absolute":
        bulletRunner.direction = dv - Math.PI / 2; // 真上が0度
        break;
    case "relative":
        bulletRunner.direction = this.direction + dv;
        break;
    case "sequence":
    default:
        bulletRunner.direction = this.lastDirection + dv;
    }
    this.lastDirection = bulletRunner.direction;

    // speed
    var s = cmd.speed || cmd.bullet.speed;
    var sv = s.value;
    switch (s.type) {
    case "relative":
        bulletRunner.speed = this.speed + sv;
        break;
    case "sequence":
        bulletRunner.speed = this.lastSpeed + sv;
        break;
    case "absolute":
    default:
        bulletRunner.speed = sv;
    }
    this.lastSpeed = bulletRunner.speed;

    // initialize position
    bulletRunner.x = gunPosition.x;
    bulletRunner.y = gunPosition.y;

    var spec = {};
    for (var key in cmd.bullet.option) {
        spec[key] = cmd.bullet.option[key];
    }
    spec.label = cmd.bullet.label;
    this.config.createNewBullet(bulletRunner, spec);
};

/**
 * @private
 * @param {bulletml.ChangeDirection} cmd
 */
bulletml.runner.SubRunner.prototype.changeDirection = function(cmd) {
    var d = cmd.direction.value * Math.PI / 180;
    var t = cmd.term;
    switch (cmd.direction.type) {
    case "aim":
        var target = this.config.target;
        if (target instanceof Function) target = target();
        this.dirFin = angleAtoB(this, target) + d;
        this.dirIncr = normalizeRadian(this.dirFin - this.direction) / t;
        break;
    case "absolute":
        this.dirFin = d - Math.PI / 2;
        this.dirIncr = normalizeRadian(this.dirFin - this.direction) / t;
        break;
    case "relative":
        this.dirFin = this.direction + d;
        this.dirIncr = normalizeRadian(this.dirFin - this.direction) / t;
        break;
    case "sequence":
        this.dirIncr = d;
        this.dirFin = this.direction + this.dirIncr * (t-1);
        break;
    }
    this.chDirEnd = this.age + t;
};

/**
 * @private
 * @param {bulletml.ChangeSpeed} cmd
 */
bulletml.runner.SubRunner.prototype.changeSpeed = function(cmd) {
    var s = cmd.speed.value;
    var t = cmd.term;
    switch (cmd.speed.type) {
    case "absolute":
        this.spdFin = s;
        this.spdIncr = (this.spdFin - this.speed) / t;
        break;
    case "relative":
        this.spdFin = s + this.speed;
        this.spdIncr = (this.spdFin - this.speed) / t;
        break;
    case "sequence":
        this.spdIncr = s;
        this.spdFin = this.speed + this.spdIncr * t;
        break;
    }
    this.chSpdEnd = this.age + t;
};

/**
 * @private
 * @param {bulletml.Accel} cmd
 */
bulletml.runner.SubRunner.prototype.accel = function(cmd) {
    var t = cmd.term;
    this.aclEnd = this.age + t;

    if (cmd.horizontal) {
        var h = cmd.horizontal.value;
        switch (cmd.horizontal.type) {
        case "absolute":
        case "sequence":
            this.aclIncrH = (h - this.speedH) / t;
            this.aclFinH = h;
            break;
        case "relative":
            this.aclIncrH = h;
            this.aclFinH = (h - this.speedH) * t;
            break;
        }
    } else {
        this.aclIncrH = 0;
        this.aclFinH = this.speedH;
    }

    if (cmd.vertical) {
        var v = cmd.vertical.value;
        switch (cmd.vertical.type) {
        case "absolute":
        case "sequence":
            this.aclIncrV = (v - this.speedV) / t;
            this.aclFinV = v;
            break;
        case "relative":
            this.aclIncrV = v;
            this.aclFinV = (v - this.speedV) * t;
            break;
        }
    } else {
        this.aclIncrV = 0;
        this.aclFinV = this.speedV;
    }
};

/**
 * @private
 * @param {bulletml.Notify} cmd
 */
bulletml.runner.SubRunner.prototype.notify = function(cmd) {
    this.onNotify(cmd.eventName, cmd.params);
};

/**
 * @param {number} radian
 */
var normalizeRadian = function(radian) {
    while (radian <= -Math.PI) {
        radian += Math.PI * 2;
    }
    while (Math.PI < radian) {
        radian -= Math.PI * 2;
    }
    return radian;
};


/**
 * @param {{x:number,y:number}} a
 * @param {{x:number,y:number}} b
 * @return {number}
 */
var angleAtoB = function(a, b) {
    return Math.atan2(b.y-a.y, b.x-a.x);
};

})();

(function() {

/** @namespace */
bulletml.output = bulletml.output || {};

/** @namespace */
bulletml.output.json = bulletml.output.json || {};

bulletml.Root.prototype.toJSON = function() {
    return {
        className: "Root",
        actions: this.actions,
        bullets: this.bullets,
        fires: this.fires,
    };
};

bulletml.Bullet.prototype.toJSON = function() {
    return {
        className: "Bullet",
        label: this.label,
        direction: this.direction,
        speed: this.speed,
        actions: this.actions,
        option: this.options,
    };
};

bulletml.BulletRef.prototype.toJSON = function() {
    return {
        className: "BulletRef",
        label: this.label,
        params: this.params,
    };
};

bulletml.Action.prototype.toJSON = function() {
    return {
        className: "Action",
        label: this.label,
        commands: this.commands,
        // params: this.params,
    };
};

bulletml.ActionRef.prototype.toJSON = function() {
    return {
        className: "ActionRef",
        label: this.label,
        params: this.params,
    };
};

bulletml.Fire.prototype.toJSON = function() {
    return {
        className: "Fire",
        label: this.label,
        direction: this.direction,
        speed: this.speed,
        bullet: this.bullet,
        option: this.option,
    };
};

bulletml.FireRef.prototype.toJSON = function() {
    return {
        className: "FireRef",
        label: this.label,
        params: this.params,
    };
};

bulletml.ChangeDirection.prototype.toJSON = function() {
    return {
        className: "ChangeDirection",
        direction: this.direction,
        term: this.term,
    };
};

bulletml.ChangeSpeed.prototype.toJSON = function() {
    return {
        className: "ChangeSpeed",
        speed: this.speed,
        term: this.term,
    };
};

bulletml.Accel.prototype.toJSON = function() {
    return {
        className: "Accel",
        horizontal: this.horizontal,
        vertical: this.vertical,
        term: this.term,
    };
};

bulletml.Wait.prototype.toJSON = function() {
    return {
        className: "Wait",
        value: this.value,
    };
};

bulletml.Vanish.prototype.toJSON = function() {
    return {
        className: "Vanish",
    };
};

bulletml.Repeat.prototype.toJSON = function() {
    return {
        className: "Repeat",
        times: this.times,
        action: this.action,
        // params: this.params,
    };
};

bulletml.Bind.prototype.toJSON = function() {
    return {
        className: "Bind",
        variable: this.variable,
        expression: this.expression,
    };
};

bulletml.Notify.prototype.toJSON = function() {
    return {
        className: "Notify",
        eventName: this.eventName,
        params: this.params,
    };
};

bulletml.Direction.prototype.toJSON = function() {
    return {
        className: "Direction",
        type: this.type,
        value: this.value,
    };
};

bulletml.Speed.prototype.toJSON = function() {
    return {
        className: "Speed",
        type: this.type,
        value: this.value,
    };
};

bulletml.Horizontal.prototype.toJSON = function() {
    return {
        className: "Horizontal",
        type: this.type,
        value: this.value,
    };
};

bulletml.Vertical.prototype.toJSON = function() {
    return {
        className: "Vertical",
        type: this.type,
        value: this.value,
    };
};

bulletml.FireOption.prototype.toJSON = function() {
    return {
        className: "FireOption",
        offsetX: this.offsetX,
        offsetY: this.offsetY,
        autonomy: this.autonomy,
    };
};

bulletml.OffsetX.prototype.toJSON = function() {
    return {
        className: "OffsetX",
        value: this.value,
    };
};

bulletml.OffsetY.prototype.toJSON = function() {
    return {
        className: "OffsetY",
        value: this.value,
    };
};

bulletml.Autonomy.prototype.toJSON = function() {
    return {
        className: "Autonomy",
        value: this.value,
    };
};


})();
