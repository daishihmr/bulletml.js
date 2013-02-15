(function() {

    /**
     * BulletMLを解析し、JavaScriptオブジェクトツリーを生成する.
     *
     * @param {(string|Document|Object)} data 弾幕定義
     * @return {bulletml.Root}
     */
    bulletml.build = function(data) {
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
