var Promise = require('bluebird');

function Hook(name, hooks) {
    this.name = name;
    this.hooks = hooks;
    this._listeners = [];
    this.argv = [];
}

Hook.prototype.trigger = function() {
    var self = this;

    this.argv = Array.prototype.slice.call(arguments);

    return Promise.each(this._listeners, function(fn) {
        if (fn instanceof Promise) {
            return fn;
        } else if (typeof fn == 'function') {
            fn = fn.bind(self);
            if (fn.length === 1) { // with next callback argument
                return new Promise(function(resolve, reject) {
                    fn(function(err) {
                        if (err) {
                            return reject(err);
                        }

                        resolve();
                    });
                });
            } else { // without next
                return Promise.try(fn);
            }
        } 
    });
};

Hook.prototype.mount = function(fn) {
    this._listeners.push(fn);
    return this;
};

Hook.prototype.hook = function(name) {
    return this.hooks(name);
};
