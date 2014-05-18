var Util = require('util'),
	EventEmitter = require('events').EventEmitter,
	cfg = require('./config.js');

/**
 * Githook
 * @param {Object} rules [detect the changed files]
 */
var Githook = function(rules) {
	EventEmitter.call(this);
	
	this.rules = rules || {};
};

Util.inherits(Githook, EventEmitter);

/**
 * set new file rule into githook rules
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
 * @param  {Array} payload [description]
 */
Githook.prototype.trigger = function(payload) {
	var ghook = this;

	payload = ghook._wrapPayload(payload);

	ghook.emit('all', payload);
	if (payload && payload.file) {
		var matches = [];
		
		for (var key in ghook.rules) {
			var rule = Util.isArray(ghook.rules[key]) ? ghook.rules[key] : [ghook.rules[key]],
				item = {
					key: key,
					files: []
				};

			rule.forEach(function(check) {
				item.files = item.files.concat(filterFiles(payload.file, check));
			});

			// filter files not empty
			// push item into matches
			if (item.files.length > 0) {
				matches.push(item);
			}
		}
		
		// has matches
		if (matches.length > 0) {
			// emit all matches
			ghook.emit('match', matches);

			matches.forEach(function(item) {
				// emit each item match event
				ghook.emit('match:' + item.key, item.files);
			});
		}
	}
};

/**
 * wrap the payload to a common format
 * @param  {Array|String|Object} mix payload 
 * @return {Object} formated payload
 */
Githook.prototype._wrapPayload = function(payload) {
	var wp = {
		file: [],
		message: ''
	};
	if (Util.isArray(payload)) {
		// payload is a changed files array
		wp.file = payload;
	} else if (typeof payload == 'string') {
		// payload is a message string
		wp.message = payload;
	} else if (Object(payload) === payload) {
		// payload is a object contains multi property
		for (var k in wp) {
			wp[k] = payload[k];
		}
	}
	return payload;
};

/**
 * proxy function of Githooks' hook
 * to keep Githooks' chain continuous
 * @return Githook
 */
Githook.prototype.hook = function() {
	return module.exports.hook.apply(module.exports, arguments);
};

/**
 * filter files array
 * @param  {Array} files
 * @param  {String|RegExp|Function} check
 * @return {Array} 
 */
function filterFiles(files, check) {
	return files.filter(function(file) {
		if (typeof check == 'string') {
			// ignore typecase equal
			return check.toLowerCase() === file.toLowerCase();
		} else if (Object.prototype.toString.call(check) == '[object RegExp]') {
			// regexp test
			return check.test(file);
		} else if (typeof check == 'function') {
			// function callback
			return check(file);
		}
	});
}

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
		},
		/**
		 * pass immediately
		 * output notice message and exit with SUCCESS_EXIT
		 * @param  {[type]} notice [description]
		 * @return {[type]}        [description]
		 */
		pass: function(notice) {
			if (notice) {
				console.log('Notice: ' + notice);
			}
			process.exit(cfg.SUCCESS_EXIT);
		}
	}
}

module.exports = Githooks();