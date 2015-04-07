var _ = require('underscore');
var Promise = require('bluebird');
var cfg = require('./config');
var Hook = require('./lib/hook');
var changedFiles = require('./lib/changed-files');
var Matcher = require('./lib/matcher');
var hooks = {};

// register hooks
_.each(cfg.AVAILABLE_HOOKS, function(name) {
	hooks[name] = new Hook(name);
});


module.exports = Githooks;

function Githooks(name) {
	if (!hooks[name]) {
		throw new Error('hook of ' + name + ' not supported!');
	}

	return hooks[name];
};

Githooks.Promise = Promise;
Githooks.changedFiles = changedFiles;

Githooks.match = function(files, rules) {
	return new Matcher(files, rules);
};

/**
 * return all hooks
 * @return {Array} hook names
 */
Githooks.hooks = function() {
	return Object.keys(hooks);
};

/**
 * output error message and exit with ERROR_EXIT
 * @param  {String|Error} error 
 */
Githooks.error = function(error) {
	if (error) {
		console.error(error.toString());
	}
	process.exit(cfg.ERROR_EXIT);
};

/**
 * pass immediately
 * output notice message and exit with SUCCESS_EXIT
 * @param  {[type]} notice [description]
 * @return {[type]}        [description]
 */
Githooks.pass = function(notice) {
	if (notice) {
		console.log('Notice: ' + notice);
	}
	process.exit(cfg.SUCCESS_EXIT);
};

