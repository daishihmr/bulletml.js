(function() {

/**
 * @constructor
 * @param {bulletml.Root} root
 */
bulletml.TickerFactory = function(root) {
    this.root = root;
};

/**
 * @param {{x:number,y:number}} attacker
 * @param {Object=} config
 * @param {string=} action
 * @return {bulletml.Ticker}
 */
bulletml.TickerFactory.prototype.create = function(attacker, config, action) {
    var topLabels = this.root.getTopActionLabels();
    if (!action && topLabels.length > 0) {
        var parentTicker = new bulletml.ParentTicker();
        topLabels.forEach(function(label) {
            parentTicker.addSubTicker(this.createSub(attacker, config, label));
        });
        return parentTicker;
    } else {
        return this.createSub(attacker, config, action);
    }
};

/**
 * @param {{x:number,y:number}} attacker
 * @param {Object=} config
 * @param {(string|bulletml.Bullet)=} action
 * @return {bulletml.SubTicker}
 */
bulletml.TickerFactory.prototype.createSub = function(attacker, config, action) {
    config = (function(base) {
        var result = {};
        var def = bulletml.DEFAULT_CONFIG;
        for (var prop in def) {
            if (def.hasOwnProperty(prop)) {
                result[prop] = def[prop];
            }
        }
        for (var prop in base) {
            if (base.hasOwnProperty(prop)) {
                result[prop] = base[prop];
            }
        }

        return result;
    })(config);

    action = action || "top";
    if (typeof action === "string") {
        return new bulletml.SubTicker(
            this,
            attacker,
            config,
            this.root.getWalker(action)
        );
    } else if (action instanceof bulletml.Bullet) {
        return new bulletml.SubTicker(
            this,
            attacker,
            config,
            action.getWalker()
        );
    } else {
        throw new Error("argument is invalid");
    }
};

bulletml.TickerFactory.prototype.createSubSimple = function(attacker, config) {
};

/**
 * @param {{x:number,y:number}} enemy
 * @param {Object=} config
 * @return {bulletml.Ticker}
 */
bulletml.Root.prototype.startAttack = function(enemy, config) {
    return new bulletml.TickerFactory(this).create(enemy, config);
};

bulletml.DEFAULT_CONFIG = {
    /** @type {number} */
    rank: 0,
    /** @type {?{x: number, y: number}} */
    target: null,
    /** @type {function(Object):?{x:number,y:number}} */
    bulletFactory: function(spec) {
        return null;
    }
};

/**
 * @constructor
 */
bulletml.Ticker = function() {};
bulletml.Ticker.prototype.tick = function() {};

/**
 * @constructor
 * @extends {bulletml.Ticker}
 */
bulletml.ParentTicker = function() {
    this.completed = false;
    this.completedChildCount = 0;
    /**
     * @type {Array.<bulletml.SubTicker>}
     */
    this.subTickers = [];
};
bulletml.ParentTicker.prototype = Object.create(bulletml.Ticker);

/**
 * @param {bulletml.SubTicker} subTicker
 */
bulletml.ParentTicker.prototype.addSubTicker = function(subTicker) {
    subTicker.parentTicker = this;
    this.subTickers.push(subTicker);
};

bulletml.ParentTicker.prototype.completeChild = function() {
    this.completedChildCount += 1;
};

/**
 * @override
 */
bulletml.ParentTicker.prototype.tick = function() {
    for (var i = this.subTickers.length; i--;) {
        this.subTickers[i].tick();
    }
    if (this.completedChildCount === this.subTickers.length) {
        this.completed = true;
    }
};

/**
 * @constructor
 * @extends {bulletml.Ticker}
 * @param {bulletml.TickerFactory} factory
 * @param {{x:number,y:number}} attacker
 * @param {Object} config
 * @param {bulletml.Walker} walker
 */
bulletml.SubTicker = function(factory, attacker, config, walker) {
    this.factory = factory;
    this.attacker = attacker;
    this.config = config;
    this.walker = walker;

    this.waitTo = -1;

    this.direction = 0.0;
    this.lastDirection = 0.0;
    this.speed = 0.0;
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
     * @type {?bulletml.ParentTicker}
     */
    this.parentTicker = null;
};
bulletml.SubTicker.prototype = Object.create(bulletml.Ticker);

/**
 * @override
 */
bulletml.SubTicker.prototype.tick = function() {
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
    if (this.attacker != null) {
        this.attacker.x += Math.cos(this.direction) * this.speed;
        this.attacker.y += Math.sin(this.direction) * this.speed;
        this.attacker.x += this.speedH;
        this.attacker.y += this.speedV;
    }

    // proccess walker
    if (this.age < this.waitTo || this.completed) {
        return;
    }
    var cmd;
    while (cmd = this.walker.next()) {
        switch (cmd.commandName) {
        case "fire":
            this.fire(/** @type {bulletml.Fire} */(cmd));
            break;
        case "wait":
            return;
        case "changeDirection":
            this.changeDirection();
            break;
        case "changeSpeed":
            this.changeSpeed();
            break;
        case "accel":
            this.accel();
            break;
        case "vanish":
            break;
        case "notify":
            this.notify();
            break;
        }
    }

    // complete
    this.completed = true;
    if (this.parentTicker !== null) {
        this.parentTicker.completeChild();
    }
};

/**
 * @private
 * @param {bulletml.Fire} cmd
 */
bulletml.SubTicker.prototype.fire = function(cmd) {
    var spec = {};
    for (var key in cmd.bullet.option) {
        spec[key] = cmd.bullet.option[key];
    }
    spec.label = cmd.bullet.label;
    var bullet = this.config.bulletFactory(spec);
    if (!bullet) {
        return;
    }

    var uniformLinearBullet = cmd.bullet.actions.length === 0;
    var bulletTicker = uniformLinearBullet ? factory.createSubSimple(this.attacker, this.config) : factory.create(this.config, cmd.bullet);
};

/**
 * @private
 */
bulletml.SubTicker.prototype.changeDirection = function() {};
/**
 * @private
 */
bulletml.SubTicker.prototype.changeSpeed = function() {};
/**
 * @private
 */
bulletml.SubTicker.prototype.accel = function() {};
/**
 * @private
 */
bulletml.SubTicker.prototype.notify = function() {};

})();
