var util = require('util'),
    _ = require('underscore'),
    minimatch = require('minimatch'),
    Promise = require('bluebird'),
    EventEmitter = require('events').EventEmitter;

module.exports = Matcher;

function Matcher(files, rules) {
    EventEmitter.call(this);

    this.files = (files instanceof Promise) ? files : Promise.resolve(files);
    this.rules = rules || {};
}

util.inherits(Matcher, EventEmitter);

/**
 * set new file rule into githook rules
 * @param  {String|Object} key
 * @param  {String|RegExp|Function|Array} value
 * @return this Matcher
 */
Matcher.prototype.rule = function(key, value) {
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

Matcher.prototype.emit = function(type, data) {
    var self = this;

    return Promise.each(this.listeners(type), function(fn) {
        if (fn instanceof Promise) {
            return fn;
        } else if (typeof fn == 'function') {
            fn = fn.bind(self);
            if (fn.length === 2) { // with next callback argument
                return new Promise(function(resolve, reject) {
                    fn(data, function(err) {
                        if (err) {
                            return reject(err);
                        }

                        resolve();
                    });
                });
            } else { // without next
                return Promise.try(function() {
                    return fn(data);
                });
            }
        } 
    });
};

Matcher.prototype.exec = function(cb) {
    var self = this;

    return this.files.then(function(files) {
        var matches = [];
        _.each(self.rules, function(rule, key) {
            rule = util.isArray(rule) ? rule : [rule];
            var item = {
                key: key,
                files: []
            };

            rule.forEach(function(check) {
                item.files = item.files.concat(filterFiles(files, check));
            });

            // filter files not empty
            // push item into matches
            if (item.files.length > 0) {
                matches.push(item);
            }
        });

        return matches;
    }).then(function(matches) {
        return Promise.all(matches.map(function(item) {
            return self.emit(item.key, item.files);
        })).then(function(alls) {
            // call callback if exist
            cb && cb(null, alls);
            return alls;
        }).catch(function(err) {
            // call callback if exist
            cb && cb(err);
        });
    });
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
            return check.toLowerCase() === file.toLowerCase()
                || minimatch(file, check);
        } else if (util.isRegExp(check)) {
            // regexp test
            return check.test(file);
        } else if (typeof check == 'function') {
            // function callback
            return check(file);
        }
    });
}