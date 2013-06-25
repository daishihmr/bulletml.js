/**
 * @preserve bulletml.js v0.5.0-SNAPSHOT
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
     * bulletmlのルート要素.
     *
     * @constructor
     * @param {Object=} data
     */
    bulletml.Root = function(data) {
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
     * @return Array.<bulletml.Action>
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
        this.root = null;
        /**
         * @type {string}
         */
        this.label = label;
        /**
         */
        this.params = [];
    };

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
        /**
         * @type {string}
         */
        this.commandName = "";
    };

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

    bulletml.Action.prototype = new bulletml.Command();

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

    bulletml.ActionRef.prototype = new bulletml.Command();

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

    bulletml.Fire.prototype = new bulletml.Command();

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

    bulletml.FireRef.prototype = new bulletml.Command();

    /**
     * @constructor
     * @extends {bulletml.Command}
     * @augments bulletml.Command
     */
    bulletml.ChangeDirection = function() {
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

    bulletml.ChangeDirection.prototype = new bulletml.Command();

    /**
     * @constructor
     * @extends {bulletml.Command}
     * @augments bulletml.Command
     */
    bulletml.ChangeSpeed = function() {
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

    bulletml.ChangeSpeed.prototype = new bulletml.Command();

    /**
     * @constructor
     * @extends {bulletml.Command}
     * @augments bulletml.Command
     */
    bulletml.Accel = function() {
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

    bulletml.Accel.prototype = new bulletml.Command();

    /**
     * @constructor
     * @extends {bulletml.Command}
     * @augments bulletml.Command
     * @param {(number|string)=} value
     */
    bulletml.Wait = function(value) {
        /**
         * @type {string}
         */
        this.commandName = "wait";
        /**
         * @type {(number|string)}
         */
        this.value = value || 0;
    };

    bulletml.Wait.prototype = new bulletml.Command();

    /**
     * @constructor
     * @extends {bulletml.Command}
     * @augments bulletml.Command
     */
    bulletml.Vanish = function() {
        /**
         * @type {string}
         */
        this.commandName = "vanish";
    };
    bulletml.Vanish.prototype = new bulletml.Command();

    /**
     * @constructor
     * @extends {bulletml.Command}
     * @augments bulletml.Command
     */
    bulletml.Repeat = function() {
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

    bulletml.Repeat.prototype = new bulletml.Command();

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
        /**
         * @type {string}
         */
        this.commandName = "bind";
        this.variable = variable;
        this.expression = expression;
    };

    bulletml.Bind.prototype = new bulletml.Command();

    /**
     * @constructor
     * @param {string} eventName
     * @param {?Array} params
     * @since 0.5
     */
    bulletml.Notify = function(eventName, params) {
        this.commandName = "notify";
        this.eventName = eventName;
        this.params = params || null;
    };

    bulletml.Notify.prototype = new bulletml.Command();

    bulletml.DummyCommand = new bulletml.Command();

    // valueクラス -----------------------------------------------

    /**
     * @constructor
     * @param {(number|string)=} value
     */
    bulletml.Direction = function(value) {
        /**
         * @type {string}
         */
        this.type = "aim";
        /**
         * @type {(string|number)}
         */
        this.value = value || 0;
    };

    /**
     * @constructor
     * @param {(number|string)=} value
     */
    bulletml.Speed = function(value) {
        /**
         * @type {string}
         */
        this.type = "absolute";
        /**
         * @type {(string|number)}
         */
        this.value = (value === undefined) ? 1 : value;
    };

    /**
     * @constructor
     * @param {(number|string)=} value
     */
    bulletml.Horizontal = function(value) {
        /**
         * @type {string}
         */
        this.type = "absolute";
        /**
         * @type {(string|number)}
         */
        this.value = value || 0;
    };

    /**
     * @constructor
     * @param {(number|string)=} value
     */
    bulletml.Vertical = function(value) {
        /**
         * @type {string}
         */
        this.type = "absolute";
        /**
         * @type {(string|number)}
         */
        this.value = value || 0;
    };

    /**
     * @constructor
     * @param {Object=} params
     * @since 0.5
     */
    bulletml.FireOption = function(params) {
        params = params || {};

        /**
         * @type {number}
         */
        this.offsetX = params.offsetX || 0;
        /**
         * @type {number}
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

    /**
     * @constructor
     * @param {number=} value
     * @since 0.5
     */
    bulletml.OffsetX = function(value) {
        this.value = value || 0;
    };

    /**
     * @constructor
     * @param {number=} value
     * @since 0.5
     */
    bulletml.OffsetY = function(value) {
        this.value = value || 0;
    };

    /**
     * @constructor
     * @param {boolean=} value
     * @since 0.5
     */
    bulletml.Autonomy = function(value) {
        this.value = !!value;
    };

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

/**
 * @deprecated Since version 0.5. You should now use 'bulletml'.
 */
var BulletML = bulletml;
