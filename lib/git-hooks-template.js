var githooks = require('../githooks.js');

require('../.githooks')(githooks);

var hook = githooks('git-hook-name');

hook.trigger.apply(hook, process.argv.slice(2))
    .then(function() {
        githooks.pass();
    }, githooks.error);

