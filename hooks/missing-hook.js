var githooks = require('../githooks.js');

require('../.githooks')(githooks);

githooks.trigger('missing-hook');

