define(["require", "exports"], function (require, exports) {
    "use strict";
    exports.isDefined = function (val) { return val != null; };
    exports.isFunction = function (val) { return typeof val === 'function'; };
    exports.noop = function (_) { };
    exports.newScript = function (src) { return function (cb) {
        var script = document.createElement('script');
        script.src = src;
        script.addEventListener('load', function () { return cb(null, src); });
        script.addEventListener('error', function () { return cb(true, src); });
        document.body.appendChild(script);
        return script;
    }; };
    var keyIterator = function (cols) {
        var keys = Object.keys(cols);
        var i = -1;
        return {
            next: function () {
                i++;
                if (i >= keys.length)
                    return null;
                else
                    return keys[i];
            }
        };
    };
    exports.parallel = function () {
        var tasks = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            tasks[_i - 0] = arguments[_i];
        }
        return function (each) { return function (cb) {
            var hasError = false;
            var successed = 0;
            var ret = [];
            tasks = tasks.filter(exports.isFunction);
            if (tasks.length <= 0)
                cb(null);
            else {
                tasks.forEach(function (task, i) {
                    var thunk = task;
                    thunk(function (err) {
                        var args = [];
                        for (var _i = 1; _i < arguments.length; _i++) {
                            args[_i - 1] = arguments[_i];
                        }
                        if (err)
                            hasError = true;
                        else {
                            if (args.length <= 1)
                                args = args[0];
                            ret[i] = args;
                            successed++;
                        }
                        if (exports.isFunction(each))
                            each.call(null, err, args, i);
                        if (hasError)
                            cb(true);
                        else if (tasks.length === successed) {
                            cb(null, ret);
                        }
                    });
                });
            }
        }; };
    };
    exports.series = function () {
        var tasks = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            tasks[_i - 0] = arguments[_i];
        }
        return function (each) { return function (cb) {
            tasks = tasks.filter(function (val) { return val != null; });
            var nextKey = keyIterator(tasks);
            var nextThunk = function () {
                var key = nextKey.next();
                var thunk = tasks[key];
                if (Array.isArray(thunk))
                    thunk = exports.parallel.apply(null, thunk).call(null, each);
                return [+key, thunk];
            };
            var key, thunk;
            var next = nextThunk();
            key = next[0];
            thunk = next[1];
            if (thunk == null)
                return cb(null);
            var ret = [];
            var iterator = function () {
                thunk(function (err) {
                    var args = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        args[_i - 1] = arguments[_i];
                    }
                    if (args.length <= 1)
                        args = args[0];
                    if (exports.isFunction(each))
                        each.call(null, err, args, key);
                    if (err)
                        cb(err);
                    else {
                        ret.push(args);
                        next = nextThunk();
                        key = next[0];
                        thunk = next[1];
                        if (thunk == null)
                            return cb(null, ret);
                        else
                            iterator();
                    }
                });
            };
            iterator();
        }; };
    };
});
