"use strict";

/**
 * namespace.
 */
var BulletML = {};

(function() {
	// for IE
	if (typeof DOMParser == "undefined") {
		DOMParser = function() {
		};
		DOMParser.prototype.parseFromString = function(string, contentType) {
			if (typeof ActiveXObject != "undefined") {
				var domDoc = new ActiveXObject("MSXML.DomDocument");
				domDoc.loadXML(string);
				return domDoc;
			} else if (typeof XMLHttpRequest != "undefined") {
				var xhr = new XMLHttpRequest();
				xhr.open("GET", "data:" + (contenttype || "application/xml")
						+ ";charset=utf-8," + encodingURIComponent(string),
						false);
				if (xhr.overrideMimeType) {
					xhr.overrideMimeType(contentType);
				}
				xhr.send(null);
				return xhr.responseXML;
			}
		};
	}

	/**
	 * 
	 */
	BulletML.build = function(xml) {
		if (typeof (xml) == "string") {
			var domParser = new DOMParser();
			return parse(domParser.parseFromString(xml, "application/xml"));
		} else if (xml.getElementsByTagName("bulletml")) {
			return parse(xml);
		} else {
			throw new Exception("cannot build " + xml);
		}
	};

	var Actor = BulletML.Actor = function() {
		this.age = 0;
		this.waitTo = -1;
		this.x = 0;
		this.y = 0;
		this.lastFireDirection = 0;
		this.speed = 0;
	};
	Actor.prototype.act = function(command) {
		if (this.waitTo <= this.age) {
			this.waitTo = -1;
			command.execute(this);
		}
	};

	var Bullet = BulletML.Bullet = function() {
		this.label = null;
		this.root = null;
		this.speed = 1;
		this.direction = new Direction();
		this.speed = new Speed();
	};
	Bullet.prototype = new Actor();

	var Root = BulletML.Root = function() {
		this.type = "none";
		this.root = this;
		this.actions = [];
		this.bullets = [];
		this.fires = [];
	};
	Root.prototype = new Actor();
	Root.prototype.findAction = function(label) {
		return search(this.actions, label);
	};
	Root.prototype.findBullet = function(label) {
		return search(this.bullets, label);
	};
	Root.prototype.findFire = function(label) {
		return search(this.fires, label);
	};

	var Command = BulletML.Command = function() {
	};
	Command.prototype.execute = function() {
	};

	var Action = BulletML.Action = function() {
		this.label = null;
		this.root = null;
		this.commands = [];
	};
	Action.prototype = new Command();

	var Fire = BulletML.Fire = function() {
		this.label = null;
		this.root = null;
		this.direction = new Direction();
		this.speed = new Speed();
		this.bullet = null;
		this.bulletRef = null;
	};
	Fire.prototype = new Command();

	var ChangeDirection = function() {
		this.direction = null;
		this.term = 0;
	};
	ChangeDirection.prototype = new Command();

	var ChangeSpeed = BulletML.ChangeSpeed = function() {
		this.speed = null;
		this.term = 0;
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
		text(dom, function(val) {
			result.value = val;
		});
		return result;
	}

	function parseSpeed(dom) {
		var result = new Speed();
		attr(dom, "type", function(type) {
			result.type = type;
		});
		text(dom, function(val) {
			result.value = val;
		});
		return result;
	}

	function parseBulletRef(dom) {
		var result = attr(dom, "label", function() {
		}, function() {
			throw new Exception("bulletRef has no label.");
		});
		return result.value;
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
		// for IE
		var attrs;
		if (element.attributes.item(0)) {
			attrs = {};
			var i = 0;
			while (element.attributes.item(i)) {
				var item = element.attributes.item(i);
				if (item.value != "" && item.value != "null") {
					attrs[item.name] = {
						value : item.value
					};
				}
				i++;
			}
		} else {
			attrs = element.attributes;
		}

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
				return result;
			}
		}

		// for IE
		if (element.childNodes[0]) {
			result = element.childNodes[0].nodeValue;
			if (result !== undefined) {
				if (callback) {
					callback(result);
					return result;
				}
			}
		}
	}

})();
