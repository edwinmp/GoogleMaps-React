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
define(["require", "exports", "GoogleMaps/lib/react", "./GoogleApi"], function (require, exports, React, GoogleApi_1) {
    "use strict";
    var Wrapper = (function (_super) {
        __extends(Wrapper, _super);
        function Wrapper(props) {
            logger.debug("Wrapper" + ".constructor");
            _super.call(this, props);
            this.libraries = ["geometry", "places", "visualization", "places"];
            this.googleMapsApiBaseUrl = "https://maps.googleapis.com/maps/api/js";
            this.loggerNode = "Wrapper";
            this.isScriptLoading = true;
            if (typeof google === "undefined") {
                this.google = null;
            }
            this.state = {
                alert: { hasAlert: false },
                isScriptLoaded: false,
            };
            this.getGoogleMapsApiUrl = this.getGoogleMapsApiUrl.bind(this);
            this.onLibraryLoaded = this.onLibraryLoaded.bind(this);
            this.onLibraryLoadingError = this.onLibraryLoadingError.bind(this);
            this.onLibraryLoading = this.onLibraryLoading.bind(this);
            this.alertDiv = this.alertDiv.bind(this);
        }
        Wrapper.prototype.render = function () {
            logger.debug(this.loggerNode + ".render");
            var props = this.props;
            var style = {
                height: props.height !== 0 ? props.height + "px" : "100%",
                width: props.width !== 0 ? props.width + "px" : "auto",
            };
            return (React.createElement("div", { style: style },
                this.alertDiv(),
                this.getContent()));
        };
        Wrapper.prototype.getContent = function () {
            logger.debug(this.loggerNode + ".getContent");
            var GoogleComponent = GoogleApi_1.default([this.getGoogleMapsApiUrl()]);
            if (this.isScriptLoading || this.state.isScriptLoaded) {
                return (React.createElement(GoogleComponent, __assign({}, this.props, { onScriptLoaded: this.onLibraryLoaded, isScriptLoaded: this.state.isScriptLoaded, isScriptLoading: this.isScriptLoading, onScriptLoading: this.onLibraryLoading, onScriptLoadingError: this.onLibraryLoadingError })));
            }
            return null;
        };
        Wrapper.prototype.alertDiv = function () {
            logger.debug(this.loggerNode + ".alertDiv");
            var alertState = this.state.alert;
            if (alertState && alertState.hasAlert) {
                return (React.createElement("div", { className: "messagePane alert alert-danger" }, alertState.alertText));
            }
            return null;
        };
        Wrapper.prototype.getGoogleMapsApiUrl = function () {
            return this.googleMapsApiBaseUrl + "?key=" + this.props.apiKey + "&libraries=" + this.libraries.join();
        };
        Wrapper.prototype.onLibraryLoaded = function () {
            logger.debug(this.loggerNode + "... Script Loaded!");
            if (!this.state.isScriptLoaded && google) {
                this.google = google;
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
        Wrapper.prototype.onLibraryLoading = function () {
            logger.debug(this.loggerNode + "... Script Loading!");
            this.isScriptLoading = true;
        };
        Wrapper.prototype.onLibraryLoadingError = function () {
            logger.debug(this.loggerNode + "... Library Loading Failed!");
            this.setState({
                alert: {
                    alertText: "Failed to load google maps script ... please check your internet connection",
                    hasAlert: true,
                },
                isScriptLoaded: false,
            });
            this.isScriptLoading = false;
        };
        Wrapper.prototype.callMicroflow = function (microflow, successCallback, errorCallback) {
            logger.debug(this.loggerNode + ".callMicroflow");
            mx.data.action({
                callback: successCallback,
                error: errorCallback,
                params: {
                    actionname: microflow,
                },
                store: {
                    caller: this.props.widget.mxform,
                },
            });
        };
        return Wrapper;
    }(React.Component));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Wrapper;
    Wrapper.defaultProps = {
        apiKey: "",
        height: 0,
        widget: null,
        width: 0,
    };
    ;
});
