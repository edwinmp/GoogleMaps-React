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
                defaultLat: Number(this.defaultLat),
                defaultLng: Number(this.defaultLng),
                zoom: this.zoom,
            };
            this.appearance = {
                defaultMapType: this.defaultMapType,
            };
        };
        GoogleMaps.prototype.update = function (mxObject, callback) {
            logger.debug(this.id + ".update");
            this.contextObj = mxObject;
            this.setMapData(callback);
            this.resetSubscriptions();
        };
        GoogleMaps.prototype.uninitialize = function () {
            logger.debug(this.id + ".uninitialize");
            ReactDOM.unmountComponentAtNode(this.domNode);
        };
        GoogleMaps.prototype.updateRendering = function (callback) {
            logger.debug(this.id + ".updateRendering");
            ReactDOM.render(React.createElement(Wrapper_1.default, {apiKey: this.apiAccessKey, appearance: this.appearance, behaviour: this.behaviour, data: this.data, height: this.mapHeight, widgetID: this.id, width: this.mapWidth}), this.domNode);
            mxLang.nullExec(callback);
        };
        GoogleMaps.prototype.resetSubscriptions = function () {
            var _this = this;
            logger.debug(this.id + "._resetSubscriptions");
            if (this.contextObj) {
                this.subscribe({
                    callback: dojoLang.hitch(this, function (guid) {
                        _this.setMapData();
                    }),
                    guid: this.contextObj.getGuid(),
                });
            }
            else {
                this.subscribe({
                    callback: dojoLang.hitch(this, function (entity) {
                        _this.setMapData();
                    }),
                    entity: this.mapEntity,
                    guid: null,
                });
            }
        };
        GoogleMaps.prototype.setMapData = function (callback) {
            logger.debug(this.id + ".setMapData");
            if (this.useContextObject) {
                this.data.push(this.fetchDataFromMxObject(this.contextObj));
                this.updateRendering(callback);
            }
            else {
                this.fetchDataFromDatabase(callback);
            }
        };
        GoogleMaps.prototype.fetchDataFromMxObject = function (object) {
            logger.debug(this.id + "fetchDataFromMxObject");
            var coordinates = { info: null, latitude: null, longitude: null };
            if (object) {
                coordinates.latitude = Number(object.get(this.latAttr));
                coordinates.longitude = Number(object.get(this.lngAttr));
                coordinates.info = this.infoWindowAttr !== "" ? object.get(this.infoWindowAttr) : null;
            }
            return coordinates ? coordinates : null;
        };
        GoogleMaps.prototype.fetchDataFromDatabase = function (callback) {
            var _this = this;
            logger.debug(this.id + "fetchDataFromDatabase");
            var xpath = "//" + this.mapEntity + this.xpathConstraint;
            if (!this.contextObj && xpath.indexOf("[%CurrentObject%]") > -1) {
                return;
            }
            if (this.contextObj) {
                xpath = xpath.replace("[%CurrentObject%]", this.contextObj.getGuid());
            }
            mx.data.get({
                callback: dojoLang.hitch(this, function (objects) {
                    _this.data = objects.map(function (mxObject) {
                        return _this.fetchDataFromMxObject(mxObject);
                    });
                    _this.updateRendering(callback);
                }),
                error: function (error) { logger.debug("Error retrieving data"); },
                xpath: xpath,
            });
        };
        return GoogleMaps;
    }(_WidgetBase));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = GoogleMaps;
    var dojoGoogleMaps = dojoDeclare("GoogleMaps.widget.GoogleMaps", [_WidgetBase], (function (Source) {
        var result = {};
        result.constructor = function () {
            logger.debug(this.id + ".constructor");
            this.data = [];
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