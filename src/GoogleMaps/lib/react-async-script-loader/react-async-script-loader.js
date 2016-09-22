var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
define(["require", "exports", "GoogleMaps/lib/react", "../hoist-non-react-statics", "./utils"], function (require, exports, React, hoist_non_react_statics_1, utils_1) {
    "use strict";
    var loadedScript = [];
    var pendingScripts = {};
    var failedScript = [];
    function startLoadingScripts(scripts, onComplete) {
        if (onComplete === void 0) { onComplete = utils_1.noop; }
        var loadNewScript = function (src) {
            if (loadedScript.indexOf(src) < 0) {
                return function (taskComplete) {
                    var callbacks = pendingScripts[src] || [];
                    callbacks.push(taskComplete);
                    pendingScripts[src] = callbacks;
                    if (callbacks.length === 1) {
                        return utils_1.newScript(src)(function (err) {
                            pendingScripts[src].forEach(function (cb) { return cb(err, src); });
                            delete pendingScripts[src];
                        });
                    }
                };
            }
        };
        var tasks = scripts.map(function (src) {
            if (Array.isArray(src)) {
                return src.map(loadNewScript);
            }
            else {
                return loadNewScript(src);
            }
        });
        utils_1.series.apply(void 0, tasks)(function (err, src) {
            if (err) {
                failedScript.push(src);
            }
            else {
                if (Array.isArray(src)) {
                    src.forEach(addCache);
                }
                else {
                    addCache(src);
                }
            }
        })(function (err) {
            removeFailedScript();
            onComplete(err);
        });
    }
    exports.startLoadingScripts = startLoadingScripts;
    var addCache = function (entry) {
        if (loadedScript.indexOf(entry) < 0) {
            loadedScript.push(entry);
        }
    };
    var removeFailedScript = function () {
        if (failedScript.length > 0) {
            failedScript.forEach(function (script) {
                var node = document.querySelector("script[src='" + script + "']");
                if (node != null) {
                    node.parentNode.removeChild(node);
                }
            });
            failedScript = [];
        }
    };
    var scriptLoader = function () {
        var scripts = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            scripts[_i - 0] = arguments[_i];
        }
        return function (WrappedComponent) {
            var ScriptLoader = (function (_super) {
                __extends(ScriptLoader, _super);
                function ScriptLoader(props, context) {
                    _super.call(this, props, context);
                    this.state = {
                        isScriptLoaded: false,
                        isScriptLoadSucceed: false,
                    };
                    this._isMounted = false;
                }
                ScriptLoader.prototype.componentDidMount = function () {
                    var _this = this;
                    this._isMounted = true;
                    startLoadingScripts(scripts, function (err) {
                        if (_this._isMounted) {
                            _this.setState({
                                isScriptLoaded: true,
                                isScriptLoadSucceed: !err,
                            }, function () {
                                if (!err) {
                                    _this.props.onScriptLoaded();
                                }
                            });
                        }
                    });
                };
                ScriptLoader.prototype.componentWillUnmount = function () {
                    this._isMounted = false;
                };
                ScriptLoader.prototype.render = function () {
                    var props = Object.assign({}, this.props, this.state);
                    return (React.createElement(WrappedComponent, __assign({}, this.props)));
                };
                return ScriptLoader;
            }(React.Component));
            ScriptLoader.propTypes = {
                onScriptLoaded: React.PropTypes.func,
            };
            ScriptLoader.defaultProps = {
                onScriptLoaded: utils_1.noop,
            };
            return hoist_non_react_statics_1.default(ScriptLoader, WrappedComponent);
        };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = scriptLoader;
});
