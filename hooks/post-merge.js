var githooks = require('../githooks.js'),
	exec = require('child_process').exec;

require('../.githooks')(githooks);

exec('git diff --name-only ORIG_HEAD HEAD --', function(error, stdout, stderr) {
	error && githooks.error(error);
	githooks.trigger('post-merge', {
		file: stdout.trim() ? stdout.trim().split(/\n/) : null
	});
});



