var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "../../lib/react-async-script-loader/react-async-script-loader", "GoogleMaps/lib/react", "./Map"], function (require, exports, react_async_script_loader_1, React, Map_1) {
    "use strict";
    var Wrapper = (function (_super) {
        __extends(Wrapper, _super);
        function Wrapper(props) {
            logger.debug("Wrapper" + ".constructor");
            _super.call(this, props);
        }
        Wrapper.prototype.componentWillReceiveProps = function (_a) {
            var isScriptLoading = _a.isScriptLoading, isScriptLoaded = _a.isScriptLoaded, onScriptLoading = _a.onScriptLoading, onError = _a.onError;
            logger.debug("Wrapper" + ".componentWillReceiveProps");
            if (isScriptLoading) {
                if (isScriptLoaded) {
                    logger.debug("Scripts Loaded... yay!!");
                }
                else {
                    onError();
                }
            }
            else {
                onScriptLoading();
            }
        };
        Wrapper.prototype.render = function () {
            logger.debug("Wrapper" + ".render");
            return (React.createElement("div", null, this.getContent()));
        };
        Wrapper.prototype.getContent = function () {
            logger.debug("Wrapper" + ".getContent");
            if (this.props.isScriptLoaded) {
                return (React.createElement("div", null, "Component Mounted!", React.createElement(Map_1.default, {google: google})));
            }
            return null;
        };
        return Wrapper;
    }(React.Component));
    ;
    function GetWrapper(scripts) {
        return react_async_script_loader_1.default(scripts)(Wrapper);
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = GetWrapper;
    ;
});
