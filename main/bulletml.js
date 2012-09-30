"use strict";

/**
 * namespace.
 */
var BulletML = {};

(function() {

	/**
	 * 
	 */
	BulletML.build = function(xml) {
		if (typeof (xml) == "string") {
			var domParser = new DOMParser();
			return parse(domParser.parseFromString(xml, "text/xml"));
		} else if (xml instanceof Document) {
			return parse(xml);
		} else {
			throw new Exception("cannot build " + xml);
		}
	};

	var Bullet = BulletML.Bullet = function() {
		this.label = null;
		this.root = null;
		this.age = 0;
		this.speed = 1;
		this.direction = new Direction();
		this.speed = new Speed();
	};

	var Root = BulletML.Root = function() {
		this.type = "none";
		this.root = this;
		this.actions = [];
		this.bullets = [];
		this.fires = [];
	};
	Root.prototype.findAction = function(label) {
		return search(this.actions, label);
	};
	Root.prototype.findBullet = function(label) {
		return search(this.bullets, label);
	};
	Root.prototype.findFire = function(label) {
		return search(this.fires, label);
	};

	var Action = BulletML.Action = function() {
		this.label = null;
		this.root = null;
	};

	var Command = BulletML.Command = function() {
	};

	var Fire = BulletML.Fire = function() {
		this.label = null;
		this.root = null;
		this.direction = 0;
		this.speed = 1;
		this.bullet = null;
		this.bulletRef = null;
	};
	Fire.prototype = new Command();

	var ChangeDirection = function(direction, term) {
		this.direction = direction;
		this.term = term;
	};
	ChangeDirection.prototype = new Command();

	var ChangeSpeed = BulletML.ChangeSpeed = function(speed, term) {
		this.speed = speed;
		this.term = term;
	};
	ChangeSpeed.prototype = new Command();

	var Accel = BulletML.Accel = function(horizontal, vertical, term) {
		this.horizontal = horizontal;
		this.vertical = vertical;
		this.term = term;
	};
	Accel.prototype = new Command();

	var Wait = BulletML.Wait = function(value) {
		this.value = value;
	};
	Wait.prototype = new Command();

	var Vanish = BulletML.Vanish = function() {
	};
	Vanish.prototype = new Command();

	var Direction = BulletML.Direction = function(value) {
		this.type = "aim";
		if (value) {
			this.value = value;
		} else {
			this.value = 0;
		}
	};

	var Speed = BulletML.Speed = function(value) {
		this.type = "absolute";
		if (value) {
			this.value = value;
		} else {
			this.value = 1;
		}
	};

	var Horizontal = BulletML.Horizontal = function(type, value) {
		this.type = type;
		this.value = value;
	};

	var Vertical = BulletML.Vertical = function(type, value) {
		this.type = type;
		this.value = value;
	};

	function parse(dom) {
		var result = new Root();

		var root = dom.getElementsByTagName("bulletml")[0];
		attr(root, "type", function(type) {
			result.type = type;
		});

		// Top Level Actions
		var actions = root.getElementsByTagName("action");
		if (actions) {
			for ( var i = 0, end = actions.length; i < end; i++) {
				var newAction = parseAction(actions[i]);
				if (newAction) {
					newAction.root = result;
					result.actions.push(newAction);
				}
			}
		}
		// find topAction
		result.topAction = search(result.actions, "top");

		// Top Level Bullets
		var bullets = root.getElementsByTagName("bullet");
		if (bullets) {
			for ( var i = 0, end = bullets.length; i < end; i++) {
				var newBullet = parseBullet(bullets[i]);
				if (newBullet) {
					newBullet.root = result;
					result.bullets.push(newBullet);
				}
			}
		}

		// Top Level Fires
		var fires = root.getElementsByTagName("fire");
		if (fires) {
			for ( var i = 0, end = fires.length; i < end; i++) {
				var newFire = parseFire(fires[i]);
				if (newFire) {
					newFire.root = result;
					result.fires.push(newFire);
				}
			}
		}

		return result;
	}

	function parseAction(dom) {
		var result = new Action();
		attr(dom, "label", function(label) {
			result.label = label;
		});
		return result;
	}

	function parseBullet(dom) {
		var result = new Bullet();
		attr(dom, "label", function(label) {
			result.label = label;
		});
		get(dom, "direction", function(direction) {
			result.direction = parseDirection(direction);
		});
		get(dom, "speed", function(speed) {
			result.speed = parseSpeed(speed);
		});
		return result;
	}

	function parseFire(dom) {
		var result = new Fire();
		attr(dom, "label", function(label) {
			result.label = label;
		});
		get(dom, "direction", function(direction) {
			result.direction = parseDirection(direction);
		})
		get(dom, "speed", function(speed) {
			reuslt.speed = parseSpeed(speed);
		})
		get(dom, "bullet", function(bullet) {
			result.bullet = parseBullet(bullet);
		});
		get(dom, "bulletRef", function(bulletRef) {
			result.bulletRef = parseBulletRef(bulletRef);
		});

		if (!result.bullet && !result.bulletRef) {
			throw new Exception("fire has no bullet or bulletRef.");
		}

		return result;
	}

	function parseDirection(dom) {
		var result = new Direction();
		attr(dom, "type", function(type) {
			result.type = type;
		});
		if (dom.textContent) {
			result.value = dom.textContent;
		}
		return result;
	}

	function parseSpeed(dom) {
		var result = new Speed();
		attr(dom, "type", function(type) {
			result.type = type;
		});
		if (dom.textContent) {
			result.value = dom.textContent;
		}
		return result;
	}

	function parseBulletRef(dom) {
		if (dom.attributes.label) {
			return dom.attributes.label.value;
		} else {
			throw new Exception("bulletRef has no label.");
		}
	}

	function search(array, label) {
		for ( var i = 0, end = array.length; i < end; i++) {
			if (array[i].label == label) {
				return array[i];
			}
		}
	}

	function get(element, tagName, callback, ifNotFound) {
		var elms = element.getElementsByTagName(tagName);
		if (elms && elms[0]) {
			if (callback) {
				callback(elms[0]);
			}
			return elms[0];
		} else if (ifNotFound) {
			ifNotFound();
		}
	}
	function attr(element, attrName, callback, ifNotFound) {
		var attr = element.attributes[attrName];
		if (attr) {
			if (callback) {
				callback(attr.value);
			}
			return attr;
		} else if (ifNotFound) {
			ifNotFound();
		}
	}

})();
