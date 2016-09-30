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
            this.loggerNode = this.props.widget.id + ".GoogleApi";
            logger.debug(this.loggerNode + ".constructor");
        }
        GoogleApi.prototype.componentWillReceiveProps = function (nextProps) {
            logger.debug(this.loggerNode + ".componentWillReceiveProps");
            if (nextProps.isScriptLoading) {
                if (!nextProps.isScriptLoaded) {
                    nextProps.onScriptLoadingError();
                }
            }
            else {
                nextProps.onScriptLoading();
            }
        };
        GoogleApi.prototype.shouldComponentUpdate = function (nextProps) {
            logger.debug(this.loggerNode + ".shouldComponentUpdate");
            return nextProps.isScriptLoaded !== this.props.isScriptLoaded;
        };
        GoogleApi.prototype.render = function () {
            logger.debug(this.loggerNode + ".render");
            return (React.createElement("div", null, this.getContent()));
        };
        GoogleApi.prototype.getContent = function () {
            logger.debug(this.loggerNode + ".getContent");
            var behaviour = this.props.behaviour;
            var mapProps = {
                centerAroundCurrentLocation: false,
                widget: this.props.widget,
            };
            if (this.props.isScriptLoaded) {
                var initialCenter = new google.maps.LatLng(Number(behaviour.defaultLat), Number(behaviour.defaultLng));
                return (React.createElement(Map_1.default, __assign({}, mapProps, {google: google, initialCenter: initialCenter})));
            }
            else {
                return (React.createElement("div", null, "Loading ..."));
            }
        };
        GoogleApi.defaultProps = {
            isScriptLoaded: false,
            isScriptLoading: true,
            widget: null,
        };
        return GoogleApi;
    }(React.Component));
    function GetMap(scripts) {
        return react_async_script_loader_1.default(scripts)(GoogleApi);
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = GetMap;
    ;
});
