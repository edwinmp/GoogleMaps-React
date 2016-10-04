var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "GoogleMaps/lib/react", "dojo/Deferred", "../utils/utils"], function (require, exports, React, dojoDeferred, utils_1) {
    "use strict";
    var evtNames = ["click", "mouseover", "recenter"];
    var Marker = (function (_super) {
        __extends(Marker, _super);
        function Marker() {
            _super.apply(this, arguments);
        }
        Marker.prototype.componentDidMount = function () {
            this.markerPromise = new dojoDeferred();
            this.renderMarker();
        };
        Marker.prototype.componentDidUpdate = function (prevProps) {
            if ((this.props.map !== prevProps.map) || (this.props.position !== prevProps.position)) {
                this.renderMarker();
            }
        };
        Marker.prototype.componentWillUnmount = function () {
            if (this.marker) {
                this.marker.setMap(null);
            }
        };
        Marker.prototype.render = function () {
            return null;
        };
        Marker.prototype.renderMarker = function () {
            var _this = this;
            var _a = this.props, map = _a.map, position = _a.position, mapCenter = _a.mapCenter;
            if (!google) {
                return;
            }
            position = position || mapCenter;
            var isLatLng = position instanceof google.maps.LatLng;
            if (!isLatLng) {
                position = new google.maps.LatLng(position.lat(), position.lng());
            }
            var markerConfig = {
                map: map,
                position: position,
            };
            this.marker = new google.maps.Marker(markerConfig);
            evtNames.forEach(function (e) {
                _this.marker.addListener(e, _this.handleEvent(e));
            });
            this.markerPromise.resolve(this.marker);
        };
        Marker.prototype.handleEvent = function (eventName) {
            var _this = this;
            return function (e) {
                eventName = "on" + utils_1.toCamelCase(eventName);
                if (_this.props[eventName]) {
                    _this.props[eventName](_this.props, _this.marker, e);
                }
            };
        };
        Marker.defaultProps = {
            google: typeof google !== "undefined" ? google : null,
            map: null,
            mapCenter: null,
            position: null,
        };
        return Marker;
    }(React.Component));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Marker;
});
//# sourceMappingURL=Marker.js.map