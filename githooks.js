var Util = require('util'),
	EventEmitter = require('events').EventEmitter,
	cfg = require('./config.js');

var Githook = function(rules) {
	EventEmitter.call(this);
	
	this.rules = rules || {};
};

Util.inherits(Githook, EventEmitter);

/**
 * set new rule into githook rules
 * @param  {String|Object} key
 * @param  {String|RegExp|Function|Array} value
 * @return this Githook
 */
Githook.prototype.rule = function(key, value) {
	if (key) {
		var rule = {};
		if (typeof key == 'string') {
			rule[key] = value;
		} else {
			rule = key;
		}

		// extend new rule
		for (var k in rule) {
			if (rule.hasOwnProperty(k)) {
				this.rules[k] = rule[k];
			}
		}
	}

	return this;
};

/**
 * [trigger description]
 * @param  {Array} changes [description]
 * @return {type}         [description]
 */
Githook.prototype.trigger = function(changes) {
	var ghook = this;

	ghook.emit('all');
	if (changes) {

	}

	process.exit(cfg.ERROR_EXIT);
};

/**
 * proxy function of Githooks' hook
 * to keep Githooks' chain continuous
 * @return Githook
 */
Githook.prototype.hook = function() {
	return module.exports.hook.apply(null, arguments);
};

/**
 * set of Githook
 */
var Githooks = function() {
	var hooks = {};
	return {
		/**
		 * add a new hook
		 * @param  {String} hook  [hook name]
		 * @param  {Object} rules [hook trigger rules]
		 * @return Githook
		 */
		hook: function(hook, rules) {
			if (cfg.AVAILABLE_HOOKS.indexOf(hook) < 0) {
				this.error('hook "' + hook + '" not supported');
			}

			if (!hooks[hook]) {
				hooks[hook] = new Githook(rules);
			}
			return hooks[hook];
		},
		/**
		 * trigger Githook
		 * @param  {String} hook [hook name]
		 */
		trigger: function(hook) {
			hooks[hook] && hooks[hook].trigger.apply(hooks[hook], Array.prototype.slice.call(arguments, 1));
		},
		/**
		 * output error message and exit with ERROR_EXIT
		 * @param  {String|Error} error 
		 */
		error: function(error) {
			if (error) {
				console.error(error.toString());
			}
			process.exit(cfg.ERROR_EXIT);
		}
	}
}

module.exports = Githooks();