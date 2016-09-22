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
define(["require", "exports", "GoogleMaps/lib/react", "../../lib/react-async-script-loader/react-async-script-loader", "./Map"], function (require, exports, React, react_async_script_loader_1, Map_1) {
    "use strict";
    var GoogleApi = (function (_super) {
        __extends(GoogleApi, _super);
        function GoogleApi(props) {
            _super.call(this, props);
            this.loggerNode = "GoogleApi";
            logger.debug(this.loggerNode + ".constructor");
        }
        GoogleApi.prototype.componentWillReceiveProps = function (_a) {
            var isScriptLoading = _a.isScriptLoading, isScriptLoaded = _a.isScriptLoaded, onScriptLoading = _a.onScriptLoading, onScriptLoadingError = _a.onScriptLoadingError;
            logger.debug(this.loggerNode + ".componentWillReceiveProps");
            if (isScriptLoading) {
                if (!isScriptLoaded) {
                    onScriptLoadingError();
                }
            }
            else {
                onScriptLoading();
            }
        };
        GoogleApi.prototype.render = function () {
            logger.debug(this.loggerNode + ".render");
            return (React.createElement("div", null, this.getContent()));
        };
        GoogleApi.prototype.getContent = function () {
            logger.debug(this.loggerNode + ".getContent");
            var mapProps = {
                centerAroundCurrentLocation: true,
            };
            if (this.props.isScriptLoaded) {
                var initialCenter = new google.maps.LatLng(37.774929, -122.419416);
                return (React.createElement(Map_1.default, __assign({}, mapProps, { google: google, initialCenter: initialCenter })));
            }
            else {
                return (React.createElement("div", null, "Loading ..."));
            }
        };
        return GoogleApi;
    }(React.Component));
    GoogleApi.defaultProps = {
        isScriptLoaded: false,
        isScriptLoading: true,
        widget: null,
    };
    ;
    function GetMap(scripts) {
        return react_async_script_loader_1.default(scripts)(GoogleApi);
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = GetMap;
    ;
});
