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

})();
