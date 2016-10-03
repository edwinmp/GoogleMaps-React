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
define(["require", "exports", "GoogleMaps/lib/react", "./Map"], function (require, exports, React, Map_1) {
    "use strict";
    var Wrapper = (function (_super) {
        __extends(Wrapper, _super);
        function Wrapper(props) {
            _super.call(this, props);
            this.addCache = function (entry) {
                if (window.loadedScript && window.loadedScript.indexOf(entry) < 0) {
                    window.loadedScript.push(entry);
                }
            };
            this.loggerNode = this.props.widgetID + ".Wrapper";
            logger.debug(this.loggerNode + ".constructor");
            this.libraries = ["geometry", "places", "visualization", "places"];
            this.googleMapsApiBaseUrl = "https://maps.googleapis.com/maps/api/js";
            if (!window.loadedScript) {
                window.loadedScript = [];
            }
            this.getGoogleMapsApiUrl = this.getGoogleMapsApiUrl.bind(this);
            this.onScriptLoaded = this.onScriptLoaded.bind(this);
            this.onScriptLoadingError = this.onScriptLoadingError.bind(this);
            this.alertDiv = this.alertDiv.bind(this);
            var src = this.getGoogleMapsApiUrl();
            if ((window.loadedScript && window.loadedScript.indexOf(src) < 0) || typeof google === "undefined") {
                this.google = null;
                this.state = {
                    alert: { hasAlert: false },
                    isScriptLoaded: false,
                };
                this.loadGoogleScript(src, this.onScriptLoaded, this.onScriptLoadingError);
            }
            else {
                this.state = {
                    alert: { hasAlert: false },
                    isScriptLoaded: true,
                };
            }
        }
        Wrapper.prototype.render = function () {
            logger.debug(this.loggerNode + ".render");
            var props = this.props;
            var style = {
                height: props.height !== 0 ? props.height + "px" : "100%",
                width: props.width !== 0 ? props.width + "px" : "auto",
            };
            return (React.createElement("div", {style: style}, 
                this.alertDiv(), 
                this.getContent()));
        };
        Wrapper.prototype.getContent = function () {
            logger.debug(this.loggerNode + ".getContent");
            if (this.state.isScriptLoaded) {
                var behaviour = this.props.behaviour;
                var appearance = this.props.appearance;
                var mapProps = {
                    centerAroundCurrentLocation: false,
                    google: google,
                    initialCenter: new google.maps.LatLng(Number(behaviour.defaultLat), Number(behaviour.defaultLng)),
                    mapTypeId: google.maps.MapTypeId[appearance.defaultMapType],
                    widgetID: this.props.widgetID,
                };
                return (React.createElement(Map_1.default, __assign({}, mapProps)));
            }
            else {
                return (React.createElement("div", null, "Loading ..."));
            }
        };
        Wrapper.prototype.loadGoogleScript = function (src, onLoad, onError) {
            var script = document.createElement("script");
            script.src = src;
            script.onload = function () { return onLoad(); };
            script.onerror = function () { return onError(); };
            document.body.appendChild(script);
        };
        ;
        Wrapper.prototype.alertDiv = function () {
            logger.debug(this.loggerNode + ".alertDiv");
            var alertState = this.state.alert;
            if (alertState && alertState.hasAlert) {
                return (React.createElement("div", {className: "alert-pane alert alert-danger"}, alertState.alertText));
            }
            return null;
        };
        Wrapper.prototype.getGoogleMapsApiUrl = function () {
            return this.googleMapsApiBaseUrl +
                "?key=" +
                this.props.apiKey +
                "&libraries=" +
                this.libraries.join();
        };
        Wrapper.prototype.onScriptLoaded = function () {
            logger.debug(this.loggerNode + ".onScriptLoaded");
            if (!this.state.isScriptLoaded && google) {
                this.google = google;
                this.addCache(this.getGoogleMapsApiUrl());
                if (this.state.alert.hasAlert) {
                    this.setState({
                        alert: { hasAlert: false },
                        isScriptLoaded: true,
                    });
                }
                else {
                    this.setState({ isScriptLoaded: true });
                }
            }
        };
        Wrapper.prototype.onScriptLoadingError = function () {
            logger.debug(this.loggerNode + ".onScriptLoadingError");
            this.setState({
                alert: {
                    alertText: "Failed to load google maps script ... please check your internet connection",
                    hasAlert: true,
                },
                isScriptLoaded: false,
            });
        };
        Wrapper.defaultProps = {
            apiKey: "",
            appearance: {},
            behaviour: {},
            height: 0,
            widgetID: "GoogleMaps",
            width: 0,
        };
        return Wrapper;
    }(React.Component));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Wrapper;
    ;
});
//# sourceMappingURL=Wrapper.js.map