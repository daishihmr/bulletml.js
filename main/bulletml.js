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
			throw new Error();
		}
	};

	var Bullet = BulletML.Bullet = function() {
		this.label = null;;
		this.root = null;
		this.age = 0;
		this.speed = 1;
	};

	var Root = BulletML.Root = function() {
		this.type = "none";
		this.root = this;
		this.actions = [];
		this.bullets = [];
	};
	Root.prototype = new Bullet();
	Root.prototype.findAction = function(label) {
		for ( var i = 0, end = this.actions.length; i < end; i++) {
			if (this.actions[i].label == label) {
				return this.actions[i];
			}
		}
	};

	var Action = BulletML.Action = function() {
		this.label = null;
		this.root = null;
	};

	function parse(dom) {
		var result = new Root();

		var root = dom.getElementsByTagName("bulletml")[0];
		if (root.attributes.type) {
			result.type = root.attributes.type.value;
		}

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
		result.actions.forEach(function(a) {
			if (a.label == "top") {
				result.topAction = a;
			}
		});

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

		return result;
	}

	function parseAction(dom) {
		var result = new Action();
		if (dom.attributes.label) {
			result.label = dom.attributes.label.value;
		}
		return result;
	}

	function parseBullet(dom) {
		var result = new Bullet();
		if (dom.attributes.label) {
			result.label = dom.attributes.label.value;
		}
		return result;
	}

})();
