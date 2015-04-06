var githooks = require('../githooks.js');

require('../.githooks')(githooks);

githooks.hook('git-hook-name').trigger().then(githooks.pass, githooks.error);

