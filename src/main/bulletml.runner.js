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
    createNewBullet: function(runner, spec) {}
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

    this.x += this.deltaX;
    this.y += this.deltaY;
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
    this.x += Math.cos(this.direction) * this.speed;
    this.y += Math.sin(this.direction) * this.speed;
    this.x += this.speedH;
    this.y += this.speedV;

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
        if (this.config.target) {
            if (cmd.option.autonomy) {
                bulletRunner.direction = angleAtoB(gunPosition, this.config.target) + dv;
            } else {
                bulletRunner.direction = angleAtoB(this, this.config.target) + dv;
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
        this.dirFin = angleAtoB(this, this.config.target) + d;
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
