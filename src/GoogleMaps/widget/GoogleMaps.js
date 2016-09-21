var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "dojo/_base/declare", "dojo/_base/lang", "mendix/lang", "mxui/widget/_WidgetBase", "GoogleMaps/lib/react", "GoogleMaps/lib/react-dom", "./components/Wrapper"], function (require, exports, dojoDeclare, dojoLang, mxLang, _WidgetBase, React, ReactDOM, Wrapper_1) {
    "use strict";
    var GoogleMaps = (function (_super) {
        __extends(GoogleMaps, _super);
        function GoogleMaps(args, elem) {
            _super.call(this);
            return new dojoGoogleMaps(args, elem);
        }
        GoogleMaps.prototype.postCreate = function () {
            logger.debug(this.id + ".postCreate");
            if (this.readOnly || this.get("disabled")) {
                this._readOnly = true;
            }
            this.onChangeEvent = this.onChangeEvent.bind(this);
            this.callMicroflow = this.callMicroflow.bind(this);
            this.getGoogleMapsApiUrl = this.getGoogleMapsApiUrl.bind(this);
            this.onLibraryLoaded = this.onLibraryLoaded.bind(this);
            this.onLibraryLoadingError = this.onLibraryLoadingError.bind(this);
            this.onLibraryLoading = this.onLibraryLoading.bind(this);
            this._updateRendering();
        };
        GoogleMaps.prototype.update = function (obj, callback) {
            logger.debug(this.id + ".update");
            this.contextObj = obj;
            this._updateRendering(callback);
            this._resetSubscriptions();
        };
        GoogleMaps.prototype.uninitialize = function () {
            logger.debug(this.id + ".uninitialize");
        };
        GoogleMaps.prototype._updateRendering = function (callback) {
            logger.debug(this.id + ".updateRendering");
            var Wrapper = Wrapper_1.default([this.getGoogleMapsApiUrl()]);
            if (this.contextObj !== null && typeof (this.contextObj) !== "undefined") {
                ReactDOM.render(React.createElement(Wrapper, {isScriptLoading: window.isScriptLoading, isScriptLoaded: window.isScriptLoaded, onScriptLoading: this.onLibraryLoading, onScriptLoaded: this.onLibraryLoaded, onError: this.onLibraryLoadingError}), this.domNode);
            }
            mxLang.nullExec(callback);
        };
        GoogleMaps.prototype.getGoogleMapsApiUrl = function () {
            return this.googleMapsApiBaseUrl + "?key=" + this.apiKey + "&libraries=" + this.libraries.join();
        };
        GoogleMaps.prototype.onLibraryLoaded = function () {
            logger.debug(this.id + "... Script Loaded!");
            if (!window.isScriptLoaded) {
                window.isScriptLoaded = true;
                this._updateRendering();
            }
        };
        GoogleMaps.prototype.onLibraryLoading = function () {
            logger.debug(this.id + "... Script Loading!");
            window.isScriptLoading = true;
        };
        GoogleMaps.prototype.onLibraryLoadingError = function () {
            logger.debug(this.id + "... Library Loading Failed...");
            window.isScriptLoaded = false;
        };
        GoogleMaps.prototype.onChangeEvent = function (value) {
            logger.debug(this.id + ".onChangeEvent");
        };
        GoogleMaps.prototype.callMicroflow = function (callback) {
            var _this = this;
            logger.debug(this.id + ".callMicroflow");
            mx.data.action({
                callback: function (obj) {
                    logger.debug(_this.id + ": Microflow executed successfully");
                },
                error: dojoLang.hitch(this, function (error) {
                    logger.error(_this.id + ": An error occurred while executing microflow: " + error.description);
                }),
                params: {
                    actionname: this.onChangeMicroflow,
                    applyto: "selection",
                    guids: [this.contextObj.getGuid()],
                },
                store: {
                    caller: this.mxform,
                },
            });
        };
        GoogleMaps.prototype._unsubscribe = function () {
            if (this.handles) {
                for (var _i = 0, _a = this.handles; _i < _a.length; _i++) {
                    var handle = _a[_i];
                    mx.data.unsubscribe(handle);
                }
                this.handles = [];
            }
        };
        GoogleMaps.prototype._resetSubscriptions = function () {
            logger.debug(this.id + "._resetSubscriptions");
            this._unsubscribe();
            if (this.contextObj) {
                var objectHandle = mx.data.subscribe({
                    callback: dojoLang.hitch(this, function (guid) {
                        this._updateRendering();
                    }),
                    guid: this.contextObj.getGuid(),
                });
                this.handles = [objectHandle];
            }
        };
        return GoogleMaps;
    }(_WidgetBase));
    var dojoGoogleMaps = dojoDeclare("GoogleMaps.widget.GoogleMaps", [_WidgetBase], (function (Source) {
        var result = {};
        result.constructor = function () {
            logger.debug(this.id + ".constructor");
            this.apiKey = "";
            this.libraries = ["geometry", "places", "visualization", "places"];
            this.googleMapsApiBaseUrl = "https://maps.googleapis.com/maps/api/js";
            if (typeof window.isScriptLoaded === "undefined") {
                window.isScriptLoaded = false;
            }
            if (typeof window.isScriptLoading === "undefined") {
                window.isScriptLoading = false;
            }
        };
        for (var i in Source.prototype) {
            if (i !== "constructor" && Source.prototype.hasOwnProperty(i)) {
                result[i] = Source.prototype[i];
            }
        }
        return result;
    }(GoogleMaps)));
    return GoogleMaps;
});
