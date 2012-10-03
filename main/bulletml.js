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
		this.rank = 0;
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
	Root.prototype.sequence = function(actionLabel) {
		if (!actionLabel && !this.topAction) {
			throw new Error("has no top action(s).");
		}
		var topAction;
		if (actionLabel) {
			topAction = this.findAction(actionLabel);
		} else {
			topAction = this.topAction;
		}
		var visitor = new Visitor(this);
		visitor.visit(topAction);
		return visitor.result;
	};

	var Visitor = function(root) {
		this.root = root;
		this.result = [];
		this.paramsStack = [];
	};
	Visitor.prototype.visit = function(command) {
		switch (command.commandName) {
		case "action":
			for ( var i = 0, end = command.commands.length; i < end; i++) {
				this.visit(command.commands[i]);
			}
			break;
		case "actionRef":
			this.pushParams(command.params);
			var action = this.root.findAction(command.label);
			for ( var i = 0, end = action.commands.length; i < end; i++) {
				this.visit(action.commands[i]);
			}
			this.paramsStack.pop();
			break;
		case "repeat":
			var start = new LoopStart();
			var times = evalNumber(command.times, this.params());
			var end = new LoopEnd(start, times);

			this.result.push(start);
			this.visit(command.action);
			this.result.push(end);
			break;
		default:
			this.result.push(command.clone(this.params()));
		}
	};
	Visitor.prototype.pushParams = function(params) {
		var cp = this.params();
		var result = [];
		for ( var i = 0, end = params.length; i < end; i++) {
			result.push(evalNumberFixRand(params[i], cp))
		}
		this.paramsStack.push(result);
	};
	Visitor.prototype.params = function() {
		if (this.paramsStack.length == 0) {
			return [];
		}
		return this.paramsStack[this.paramsStack.length - 1];
	};

	/**
	 * bullet要素.
	 */
	var Bullet = BulletML.Bullet = function() {
		this.label = null;
		this.root = null;
		this.direction = new Direction(0);
		this.speed = new Speed(1);
		this.actions = [];
	};
	Bullet.prototype.sequence = function() {
		var visitor = new Visitor(this.root);
		for ( var i = 0, end = this.actions.length; i < end; i++) {
			visitor.visit(this.actions[i]);
		}
		return visitor.result;
	};
	Bullet.prototype.clone = function(params) {
		var result = new Bullet();
		result.label = this.label;
		result.root = this.root;
		if (this.direction) {
			result.direction = new Direction(evalNumber(this.direction.value,
					params));
			result.direction.type = this.direction.type;
		}
		if (this.speed) {
			result.speed = new Speed(evalNumber(this.speed.value, params));
			result.speed.type = this.speed.type;
		}
		for ( var i = 0, end = this.actions.length; i < end; i++) {
			result.actions.push(this.actions[i].clone(params));
		}
		return result;
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
		this.commandName = null;
	};
	Command.prototype.clone = function() {
		return this;
	};

	var Action = BulletML.Action = function() {
		this.commandName = "action";
		this.label = null;
		this.root = null;
		this.commands = [];
	};
	Action.prototype = new Command();
	Action.prototype.clone = function(params) {
		var result = new Action();
		result.label = this.label;
		result.root = this.root;
		for ( var i = 0, end = this.commands.length; i < end; i++) {
			result.commands.push(this.commands[i].clone(params));
		}
		return result;
	};

	var ActionRef = BulletML.ActionRef = function() {
		this.commandName = "actionRef";
		this.label = null;
		this.params = [];
	};
	ActionRef.prototype = new Command();
	ActionRef.prototype.clone = function(params) {
		var result = new ActionRef();
		result.label = this.label;
		for ( var i = 0, end = this.params.length; i < end; i++) {
			result.params.push(evalNumberFixRand(this.params[i], params));
		}
		return result;
	};

	var Fire = BulletML.Fire = function() {
		this.commandName = "fire";
		this.label = null;
		this.root = null;
		this.direction = null;
		this.speed = null;
		this.bullet = null;
	};
	Fire.prototype = new Command();
	Fire.prototype.clone = function(params) {
		var result = new Fire();
		result.label = this.label;
		result.root = this.root;
		if (this.direction) {
			result.direction = new Direction(evalNumber(this.direction.value,
					params));
			result.direction.type = this.direction.type;
		}
		if (this.speed) {
			result.speed = new Speed(evalNumber(this.speed.value, params));
			result.speed.type = this.speed.type;
		}

		if (this.bullet) {
			if (this.bullet instanceof Bullet) {
				result.bullet = this.bullet.clone(params);
			} else if (this.bullet instanceof BulletRef) {
				var origBullet = this.root.findBullet(this.bullet.label);
				if (!origBullet) {
					return result;
				}
				var newParam = [];
				for ( var i = 0, end = this.bullet.params.length; i < end; i++) {
					newParam.push(evalNumberFixRand(this.bullet.params[i],
							params));
				}
				result.bullet = origBullet.clone(newParam);
			}
		}
		return result;
	}

	var FireRef = BulletML.FireRef = function() {
		this.commandName = "fireRef";
		this.label = null;
		this.params = [];
	};
	FireRef.prototype = new Command();
	FireRef.prototype.clone = function(params) {
		var orig = this.root.findFire(this.label);
		if (orig) {
			var newParams = [];
			for ( var i = 0, end = this.params.length; i < end; i++) {
				newParams.push(evalNumberFixRand(this.params[i], params));
			}
			return orig.clone(newParams);
		}
	};

	var ChangeDirection = BulletML.ChangeDirection = function() {
		this.commandName = "changeDirection";
		this.direction = null;
		this.term = 0;
	};
	ChangeDirection.prototype = new Command();
	ChangeDirection.prototype.clone = function(params) {
		var result = new ChangeDirection();
		if (this.direction) {
			result.direction = new Direction(evalNumber(this.direction.value,
					params));
			result.direction.type = this.direction.type;
		}
		result.term = evalNumber(this.term, params);
		return result;
	};

	var ChangeSpeed = BulletML.ChangeSpeed = function() {
		this.commandName = "changeSpeed";
		this.speed = null;
		this.term = 0;
	};
	ChangeSpeed.prototype = new Command();
	ChangeSpeed.prototype.clone = function(params) {
		var result = new ChangeSpeed();
		if (this.speed) {
			result.speed = new Speed(evalNumber(this.speed.value, params));
			result.speed.type = this.speed.type;
		}
		result.term = evalNumber(this.term, params);
		return result;
	};

	var Accel = BulletML.Accel = function() {
		this.commandName = "accel";
		this.horizontal = null;
		this.vertical = null;
		this.term = 0;
	};
	Accel.prototype = new Command();
	Accel.prototype.clone = function(params) {
		var result = new Accel();
		if (this.horizontal) {
			result.horizontal = new Horizontal(evalNumber(
					this.horizontal.value, params));
			result.horizontal.type = this.horizontal.type;
		}
		if (this.vertical) {
			result.vertical = new Vertical(evalNumber(this.vertical.value,
					params));
			result.vertical.type = this.vertical.type;
		}
		result.term = evalNumber(this.term, params);
		return result;
	};

	var Wait = BulletML.Wait = function(value) {
		this.commandName = "wait";
		if (value) {
			this.value = value;
		} else {
			this.value = 0;
		}
	};
	Wait.prototype = new Command();
	Wait.prototype.clone = function(params) {
		return new Wait(evalNumber(this.value, params));
	};

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

	var LoopStart = BulletML.LoopStart = function() {
		this.commandName = "loopStart";
	};
	LoopStart.prototype = new Command();
	var LoopEnd = BulletML.LoopEnd = function(start, times) {
		this.commandName = "loopEnd";
		this.start = start;
		this.times = times;
		this.loopCount = -1;
	};
	LoopEnd.prototype = new Command();

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
			this.value = value;
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
		if (!result.topAction) {
			result.topAction = search(result.actions, "top1");
		}

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

	function evalNumberFixRand(value, params) {
		if (typeof (value) == "number") {
			return value;
		}
		value = value.replace(/\$rand/g, "(" + Math.random() + ")");
		value = value.replace(/\$rank/g, "0");
		if (params) {
			for ( var i = 0, end = params.length; i < end; i++) {
				var pat = new RegExp("\\$" + (i + 1), "g");
				value = value.replace(pat, "(" + params[i] + ")");
			}
		}
		return value;
	}

	function evalNumber(value, params) {
		if (typeof (value) == "number") {
			return value;
		}
		value = value.replace(/\$rand/g, "Math.random()");
		value = value.replace(/\$rank/g, "0");
		if (params) {
			for ( var i = 0, end = params.length; i < end; i++) {
				var pat = new RegExp("\\$" + (i + 1), "g");
				value = value.replace(pat, "(" + params[i] + ")");
			}
		}
		return value;
	}

	function search(array, label) {
		for ( var i = 0, end = array.length; i < end; i++) {
			if (array[i].label == label) {
				return array[i];
			}
		}
	}

	function get(element, tagName, callback, ifNotFound) {
		var children = element.childNodes;
		for ( var i = 0, end = children.length; i < end; i++) {
			if (children[i].tagName && children[i].tagName == tagName) {
				if (callback) {
					callback(children[i]);
				}
				return callback(children[i]);
			}
		}
		if (ifNotFound) {
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
