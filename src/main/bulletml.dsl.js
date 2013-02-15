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
