var githooks = require('../githooks.js'),
    exec = require('child_process').exec;

require('../.githooks')(githooks);


exec('git diff --cached --diff-filter=ACMRTUXB --name-only ORIG_HEAD --', function(error, stdout, stderr) {
    error && githooks.error(error);
    githooks.trigger('pre-push', {
        file: stdout.trim() ? stdout.trim().split(/\n/) : null
    });
});
