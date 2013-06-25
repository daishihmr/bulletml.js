(function() {
    
    /**
     * @constructor
     * @param {bulletml.Root} root
     * @param {number=} rank
     */
    bulletml.Walker = function(root, rank) {
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
        /**
         * globalScope variables.
         * @type {Object.<string,number>}
         */
        this._globalScope = {
            "$rank" : rank || 0
        };
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
                    this._localScope.loopEnd = this._evalParam(n.times)|0;
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
                    f.option = n.option;
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
        if (typeof exp === "number") {
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
    bulletml.Root.prototype.getWalker = function(actionLabel, rank) {
        var w = new bulletml.Walker(this, rank);
        var action = this.findAction(actionLabel);
        if (action) {
            w._action = action;
        }
        return w;
    };

    /**
     * @return {bulletml.Walker}
     */
    bulletml.Bullet.prototype.getWalker = function(rank) {
        var w = new bulletml.Walker(this.root, rank);
        var action = new bulletml.Action();
        action.root = this.root;
        action.commands = this.actions;
        w._action = action;
        w._localScope = this._localScope;
        return w;
    };

})();
