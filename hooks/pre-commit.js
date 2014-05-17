var githooks = require('../githooks.js'),
	exec = require('child_process').exec;

require('../.githooks')(githooks);

exec('git rev-parse --verify HEAD', function(error, stdout, stderr) {
	error && githooks.error(error);
	var against = stdout ? 'HEAD' : '4b825dc642cb6eb9a060e54bf8d69288fbee4904';
	exec('git diff --cached --diff-filter=ACMRTUXB --name-only ' + against + ' --', function(error, stdout, stderr) {
		error && githooks.error(error);
		githooks.trigger('pre-commit', stdout.trim() ? stdout.trim().split(/\n/) : null);
	});
});
