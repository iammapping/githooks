var Promise = require('bluebird'),
    exec = require('child_process').exec;

module.exports = function(sha) {
    return new Promise(function(resolve, reject) {
        exec('git rev-parse --verify ' + (sha || 'HEAD'), function(err, stdout, stderr) {
            if (err || stderr) {
                return reject(err || stderr);
            }

            resolve(stdout.trim());
        });
    });
};