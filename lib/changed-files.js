var Promise = require('bluebird'),
    _ = require('underscore'),
    fs = require('fs'),
    path = require('path'),
    exec = require('child_process').exec,
    head = require('./head');

module.exports = changedFiles;

function changedFiles(baseSha, targetSha, options) {
    options = _.extend({
        '--diff-filter': 'ACMRTUXB'
    }, options);

    return Promise.all([sha(baseSha), sha(targetSha)]).spread(function(baseSha, targetSha) {
        return new Promise(function(resolve, reject) {
            var gitDiff = 'git diff --name-only';
            _.each(options, function(v, k) {
                gitDiff += ' ' + k + '=' + v;
            });

            exec(gitDiff + ' ' + baseSha + ' ' + targetSha, function(err, stdout, stderr) {
                if (err || stderr) {
                    return reject(err || stderr);
                }

                stdout = stdout.trim();
                resolve(stdout ? stdout.split(/\n/) : []);
            });
        });
    });
};

function sha(sha) {
    return new Promise(function(resolve, reject) {
        if (sha != 'HEAD' || sha != 'ORIG_HEAD') {
            return resolve(sha);
        }

        head(sha).then(resolve, function() {
            // default sha
            resolve('4b825dc642cb6eb9a060e54bf8d69288fbee4904');
        });
    });
}

changedFiles.staged = function() {
    return changedFiles('--cached', 'HEAD');
};

changedFiles.merged = function() {
    return changedFiles('ORIG_HEAD', 'HEAD');
};

changedFiles.commited = function() {
    return changedFiles('--cached', 'ORIG_HEAD');
};

changedFiles.changed = function(logFile) {
    var last = new Log(logFile || path.join(process.cwd(), '.git/LAST_LOGGED_HEAD'));

    return Promise.all([
        last.get().catch(function(err) {
            // resolve forever
            return Promise.resolve();
        }), 
        head()
    ]).spread(function(lastSha, headSha) {
        return Promise.all([
            changedFiles(lastSha || headSha, headSha), 
            last.set(headSha).catch(function(err) {
                // resolve forever
                return Promise.resolve();
            })
        ]).spread(function(files) {
            return files;
        });
    });
};

function Log(logFile) {
    this.get = function() {
        return new Promise(function(resolve, reject) {
            fs.readFile(logFile, {'encoding': 'utf8'}, function(err, sha) {
                if (err) {
                    return reject(err);
                }

                resolve(sha.trim());
            });
        });
    };

    this.set = function(sha) {
        return new Promise(function(resolve, reject) {
            fs.writeFile(logFile, sha, {'encoding': 'utf8', 'mode': '644'}, function(err) {
                if (err) {
                    return reject(err);
                }

                resolve();
            });
        });
    };
};

