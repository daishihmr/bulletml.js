/*
 * bullet.js v0.3.0-SNAPSHOT
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

(function() {
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
            throw new Error("cannot build " + xml);
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
    BulletML.Root.prototype.getWalker = function(actionLabel, rank) {
        var w = new BulletML.Walker(this, rank);
        var action = this.findAction(actionLabel);
        if (action) {
            w._action = action;
            return w;
        }
    };

    BulletML.Walker = function(root, rank) {
        this._root = root;
        this._stack = [];
        this._localScopeStack = [];
        this._cursor = -1;
        this._action = null;
        this._localScope = {};
        this._globalScope = {
            $rank : rank
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
                    return this.next();
                case "actionRef":
                    this._localScopeStack.push(this._localScope);
                    this._localScope = this.newScope(n.params);

                    this.pushStack();
                    this._action = this._root.findAction(n.label,
                            this._localScope, this._globalScope);
                    return this.next();
                case "repeat":
                    n.counter = 0;
                    n.end = this.eval(n.times, this._localScope,
                            this._globalScope);
                    this.pushStack();
                    this._action = n.action;
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
                    // TODO
                    break;
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
                var repeat = this._action.commands[this._cursor];
                if (repeat && repeat.commandName == "actionRef") {
                    this._localScope = this._localScopeStack.pop();
                    return this.next();
                } else if (repeat && repeat.commandName == "repeat") {
                    repeat.counter++;
                    if (repeat.counter < repeat.end) {
                        this.pushStack();
                        this._action = repeat.action;
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
            cursor : this._cursor
        });
        this._cursor = -1;
    };
    BulletML.Walker.prototype.popStack = function() {
        var p = this._stack.pop();
        if (p) {
            this._cursor = p.cursor;
            this._action = p.action;
        } else {
            this._cursor = -1;
            this._action = null;
        }
    };
    BulletML.Walker.prototype.eval = function(exp) {
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
        for ( var i = 0, end = params.length; i < end; i++) {
            result["$" + (i + 1)] = this.eval(params[i]);
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
        var b = this.root.findBullet(this.label).clone(walker);
        walker._localScope = bkup;
        return b;
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
