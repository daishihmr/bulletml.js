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
	 * bulletmlをパースしJavaScriptオブジェクトツリーを生成する.
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

	/**
	 * bulletmlのルート要素.
	 */
	var Root = BulletML.Root = function() {
		this.type = "none";
		this.root = this;
		this.topAction = null;
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

	/**
	 * bullet要素.
	 */
	var Bullet = BulletML.Bullet = function() {
		this.label = null;
		this.root = null;
		this.speed = 1;
		this.direction = new Direction();
		this.speed = new Speed();
		this.actions = [];
	};
	var BulletRef = BulletML.BulletRef = function() {
		this.label = null;
		this.params = [];
	};

	// commandクラス --------------------------------------------

	/**
	 * 動作を表す抽象クラス.
	 * 
	 * Actionのcommands配列に格納される.
	 */
	var Command = BulletML.Command = function() {
		this.root = null;
	};
	Command.prototype.execute = function() {
	};

	var Action = BulletML.Action = function() {
		this.commandName = "action";
		this.label = null;
		this.root = null;
		this.commands = [];
	};
	Action.prototype = new Command();
	Action.prototype.clone = function(params) {
	};

	var ActionRef = BulletML.ActionRef = function() {
		this.commandName = "actionRef";
		this.label = null;
		this.params = [];
	};
	ActionRef.prototype.getEntity = function() {
		return root.findAction(this.label).clone(this.params);
	};

	var Fire = BulletML.Fire = function() {
		this.commandName = "fire";
		this.label = null;
		this.root = null;
		this.direction = new Direction();
		this.speed = new Speed();
		this.bullet = null;
	};
	Fire.prototype = new Command();

	var FireRef = BulletML.FireRef = function() {
		this.commandName = "fireRef";
		this.label = null;
		this.params = [];
	};
	FireRef.prototype = new Command();

	var ChangeDirection = function() {
		this.commandName = "changeDirection";
		this.direction = null;
		this.term = 0;
	};
	ChangeDirection.prototype = new Command();

	var ChangeSpeed = BulletML.ChangeSpeed = function() {
		this.commandName = "changeSpeed";
		this.speed = null;
		this.term = 0;
	};
	ChangeSpeed.prototype = new Command();

	var Accel = BulletML.Accel = function() {
		this.commandName = "accel";
		this.horizontal = new Horizontal();
		this.vertical = new Vertical();
		this.term = 0;
	};
	Accel.prototype = new Command();

	var Wait = BulletML.Wait = function(value) {
		this.commandName = "wait";
		if (value) {
			this.value = value;
		} else {
			this.value = 0;
		}
	};
	Wait.prototype = new Command();

	var Vanish = BulletML.Vanish = function() {
		this.commandName = "vanish";
	};
	Vanish.prototype = new Command();

	var Repeat = BulletML.Repeat = function() {
		this.commandName = "repeat";
		this.times = 0;
		this.action = null;
	};
	Repeat.prototype = new Command();

	// valueクラス -----------------------------------------------

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
	var Horizontal = BulletML.Horizontal = function(value) {
		this.type = "relative";
		if (value) {
			this.value = vale;
		} else {
			this.value = 0;
		}
	};
	var Vertical = BulletML.Vertical = function(value) {
		this.type = "relative";
		if (value) {
			this.value = value;
		} else {
			this.value = 0;
		}
	};

	// parse関数 -----------------------------------------------

	function parse(element) {
		var result = new Root();

		var root = element.getElementsByTagName("bulletml")[0];
		attr(root, "type", function(type) {
			result.type = type;
		});

		// Top Level Actions
		var actions = root.getElementsByTagName("action");
		if (actions) {
			for ( var i = 0, end = actions.length; i < end; i++) {
				var newAction = parseAction(result, actions[i]);
				if (newAction) {
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
				var newBullet = parseBullet(result, bullets[i]);
				if (newBullet) {
					result.bullets.push(newBullet);
				}
			}
		}

		// Top Level Fires
		var fires = root.getElementsByTagName("fire");
		if (fires) {
			for ( var i = 0, end = fires.length; i < end; i++) {
				var newFire = parseFire(result, fires[i]);
				if (newFire) {
					result.fires.push(newFire);
				}
			}
		}

		return result;
	}

	function parseAction(root, element) {
		var result = new Action();
		attr(element, "label", function(label) {
			result.label = label;
		});
		each(element, ".", function(commandElm) {
			switch (commandElm.tagName) {
			case "action":
				result.commands.push(parseAction(root, commandElm));
				break;
			case "actionRef":
				result.commands.push(parseActionRef(root, commandElm));
				break;
			case "fire":
				result.commands.push(parseFire(root, commandElm));
				break;
			case "fireRef":
				result.commands.push(parseFireRef(root, commandElm));
				break;
			case "changeDirection":
				result.commands.push(parseChangeDirection(commandElm));
				break;
			case "changeSpeed":
				result.commands.push(parseChangeSpeed(commandElm));
				break;
			case "accel":
				result.commands.push(parseAccel(commandElm));
				break;
			case "wait":
				result.commands.push(parseWait(commandElm));
				break;
			case "vanish":
				result.commands.push(parseVanish(commandElm));
				break;
			case "repeat":
				result.commands.push(parseRepeat(root, commandElm));
				break;
			}
		});
		result.root = root;
		return result;
	}

	function parseActionRef(root, element) {
		var result = new ActionRef();

		attr(element, "label", function(label) {
			result.label = label;
		});
		each(element, /param$/, function(param) {
			result.params.push(text(param));
		});
		result.root = root;

		return result;
	}

	function parseBullet(root, element) {
		var result = new Bullet();

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
			if (action.tagName == "action") {
				result.actions.push(parseAction(root, action));
			} else if (action.tagName == "actionRef") {
				result.actions.push(parseActionRef(root, action));
			}
		});
		result.root = root;

		return result;
	}

	function parseBulletRef(root, element) {
		var result = new BulletRef();

		attr(element, "label", function(label) {
			result.label = label;
		});
		each(element, /param$/, function(param) {
			result.params.push(text(param));
		});
		result.root = root;

		return result;
	}

	function parseFire(root, element) {
		var result = new Fire();

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
		get(element, "bulletRef", function(bulletRef) {
			result.bullet = parseBulletRef(root, bulletRef);
		});

		if (!result.bullet && !result.bulletRef) {
			throw new Exception("fire has no bullet or bulletRef.");
		}

		result.root = root;
		return result;
	}

	function parseFireRef(root, element) {
		var result = new FireRef();

		attr(element, "label", function(label) {
			result.label = label;
		});
		each(element, /param$/, function(param) {
			result.params.push(text(param));
		});
		result.root = root;

		return result;
	}

	function parseChangeDirection(element) {
		var result = new ChangeDirection();

		get(element, "direction", function(direction) {
			result.direction = parseDirection(direction);
		});
		get(element, "term", function(term) {
			result.term = text(term);
		});

		return result;
	}

	function parseChangeSpeed(element) {
		var result = new ChangeSpeed();

		get(element, "speed", function(speed) {
			result.speed = parseSpeed(speed);
		});
		get(element, "term", function(term) {
			result.term = text(term);
		});

		return result;
	}

	function parseAccel(element) {
		var result = new Accel();

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

	function parseWait(element) {
		var result = new Wait();

		result.value = text(element);

		return result;
	}

	function parseVanish(element) {
		return new Vanish();
	}

	function parseRepeat(root, element) {
		var result = new Repeat();

		get(element, "action", function(action) {
			result.action = parseAction(root, action);
		});
		get(element, "actionRef", function(actionRef) {
			result.action = parseActionRef(root, actionRef);
		});
		get(element, "times", function(times) {
			result.times = text(times);
		});

		return result;
	}

	function parseDirection(element) {
		return setTypeAndValue(new Direction(), element);
	}

	function parseSpeed(element) {
		return setTypeAndValue(new Speed(), element);
	}

	function parseHorizontal(element) {
		return setTypeAndValue(new Horizontal(), element);
	}

	function parseVertical(element) {
		return setTypeAndValue(new Vertical(), element);
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

	// utility ---------------------------------------------------

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
	function each(element, filter, callback) {
		var children = element.childNodes;
		for ( var i = 0, end = children.length; i < end; i++) {
			if (children[i].tagName && children[i].tagName.match(filter)) {
				callback(children[i]);
			}
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
			}
			return result;
		}

		// for IE
		if (element.childNodes[0]) {
			result = element.childNodes[0].nodeValue;
			if (result !== undefined) {
				if (callback) {
					callback(result);
				}
				return result;
			}
		}
	}

})();
