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
