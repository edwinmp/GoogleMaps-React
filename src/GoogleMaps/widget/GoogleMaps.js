var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "dojo/_base/declare", "dojo/_base/lang", "dojo/dom-style", "mendix/lang", "mxui/widget/_WidgetBase", "GoogleMaps/lib/react", "GoogleMaps/lib/react-dom", "./components/Wrapper"], function (require, exports, dojoDeclare, dojoLang, domStyle, mxLang, _WidgetBase, React, ReactDOM, Wrapper_1) {
    "use strict";
    var GoogleMaps = (function (_super) {
        __extends(GoogleMaps, _super);
        function GoogleMaps(args, elem) {
            _super.call(this);
            return new dojoGoogleMaps(args, elem);
        }
        GoogleMaps.prototype.postCreate = function () {
            logger.debug(this.id + ".postCreate");
            domStyle.set(this.domNode, {
                height: this.mapHeight !== 0 ? this.mapHeight + "px" : "auto",
                position: "relative",
                width: this.mapWidth !== 0 ? this.mapWidth + "px" : "100%",
            });
            this.behaviour = {
                apiAccessKey: this.apiAccessKey,
                defaultLat: this.defaultLat,
                defaultLng: this.defaultLng,
            };
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
            ReactDOM.unmountComponentAtNode(this.domNode);
        };
        GoogleMaps.prototype._updateRendering = function (callback) {
            logger.debug(this.id + ".updateRendering");
            if (this.contextObj !== null && typeof (this.contextObj) !== "undefined") {
                ReactDOM.render(React.createElement(Wrapper_1.default, {apiKey: this.apiAccessKey, behaviour: this.behaviour, widgetID: this.id, width: this.mapWidth, height: this.mapHeight}), this.domNode);
            }
            mxLang.nullExec(callback);
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
            var _this = this;
            logger.debug(this.id + "._resetSubscriptions");
            this._unsubscribe();
            if (this.contextObj) {
                var objectHandle = mx.data.subscribe({
                    callback: dojoLang.hitch(this, function (guid) {
                        _this._updateRendering();
                    }),
                    guid: this.contextObj.getGuid(),
                });
                this.handles = [objectHandle];
            }
        };
        return GoogleMaps;
    }(_WidgetBase));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = GoogleMaps;
    var dojoGoogleMaps = dojoDeclare("GoogleMaps.widget.GoogleMaps", [_WidgetBase], (function (Source) {
        var result = {};
        result.constructor = function () {
            logger.debug(this.id + ".constructor");
        };
        for (var i in Source.prototype) {
            if (i !== "constructor" && Source.prototype.hasOwnProperty(i)) {
                result[i] = Source.prototype[i];
            }
        }
        return result;
    }(GoogleMaps)));
});
//# sourceMappingURL=GoogleMaps.js.map