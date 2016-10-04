var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "GoogleMaps/lib/react", "GoogleMaps/lib/react-dom", "../../lib/Polyfills", "../utils/utils", "dojo/Deferred"], function (require, exports, React, ReactDOM, Polyfills_1, utils_1, dojoDeferred) {
    "use strict";
    var mapStyles = {
        container: {
            height: "100%",
            position: "absolute",
            width: "100%",
        },
        map: {
            bottom: 0,
            left: 0,
            position: "absolute",
            right: 0,
            top: 0,
        },
    };
    var evtNames = ["ready", "click", "dragend", "center_changed"];
    var Map = (function (_super) {
        __extends(Map, _super);
        function Map(props) {
            _super.call(this, props);
            this.loggerNode = this.props.widgetID + ".Map";
            logger.debug(this.loggerNode + ".constructor");
            if (!props.hasOwnProperty("google") || props.google === null) {
                throw new Error(this.loggerNode + ".You must include a 'google' prop & it must not be null");
            }
            this.listeners = [];
            this.state = {
                currentLocation: new google.maps.LatLng(props.initialCenter.lat(), props.initialCenter.lng()),
            };
        }
        Map.prototype.componentDidMount = function () {
            var _this = this;
            logger.debug(this.loggerNode + ".componentDidMount");
            if (this.props.centerAroundCurrentLocation) {
                if (navigator && navigator.geolocation) {
                    this.geoPromise = new dojoDeferred(function (resolve, reject) {
                        navigator.geolocation.getCurrentPosition(resolve, reject);
                    });
                    this.geoPromise.promise.then(function (pos) {
                        var coords = pos.coords;
                        _this.setState({
                            currentLocation: new google.maps.LatLng(coords.latitude, coords.longitude),
                        });
                    }, function (error) { return error; });
                }
            }
            this.loadMap();
        };
        Map.prototype.componentDidUpdate = function (prevProps, prevState) {
            logger.debug(this.loggerNode + ".componentDidUpdate");
            if (prevProps.google !== this.props.google) {
                this.loadMap();
            }
            if (this.props.center !== prevProps.center) {
                this.setState({
                    currentLocation: this.props.center,
                });
            }
            if (prevState.currentLocation !== this.state.currentLocation) {
                this.recenterMap();
            }
        };
        Map.prototype.componentWillUnmount = function () {
            var _this = this;
            logger.debug(this.loggerNode + ".componentWillUnmount");
            if (this.geoPromise) {
                this.geoPromise.cancel("Component is unmounting!", false);
            }
            Object.keys(this.listeners).forEach(function (e) {
                google.maps.event.removeListener(_this.listeners[e]);
            });
        };
        Map.prototype.render = function () {
            var _this = this;
            logger.debug(this.loggerNode + ".render");
            var style = Polyfills_1.ObjectAssign({}, mapStyles.map, this.props.style);
            var containerStyles = Polyfills_1.ObjectAssign({}, mapStyles.container, this.props.containerStyle);
            return (React.createElement("div", {style: containerStyles, className: this.props.className}, 
                React.createElement("div", {style: style, ref: function (c) { return _this.mapRef = c; }}, "Loading map..."), 
                this.renderChildren()));
        };
        Map.prototype.loadMap = function () {
            var _this = this;
            logger.debug(this.loggerNode + ".loadMap");
            var props = this.props;
            if (props && props.google) {
                var maps = google.maps;
                var mapRef = this.mapRef;
                var node = ReactDOM.findDOMNode(mapRef);
                var curr = this.state.currentLocation;
                var center = new google.maps.LatLng(curr.lat(), curr.lng());
                var mapConfig = Polyfills_1.ObjectAssign({}, {
                    center: center,
                    mapTypeId: props.mapTypeId,
                    zoom: props.zoom,
                });
                this.map = new maps.Map(node, mapConfig);
                evtNames.forEach(function (e) {
                    _this.listeners[e] = _this.map.addListener(e, _this.handleEvent(e));
                });
                maps.event.trigger(this.map, "ready");
                this.forceUpdate();
            }
        };
        Map.prototype.handleEvent = function (evtName) {
            var _this = this;
            logger.debug(this.loggerNode + ".handleEvent");
            var timeout;
            var handlerName = "on" + utils_1.toCamelCase(evtName);
            return function (e) {
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                }
                timeout = setTimeout(function () {
                    if (_this.props[handlerName]) {
                        _this.props[handlerName](_this.props, _this.map, e);
                    }
                }, 0);
            };
        };
        Map.prototype.recenterMap = function () {
            logger.debug(this.loggerNode + ".recenterMap");
            var map = this.map;
            if (!this.props.google) {
                return;
            }
            var maps = google.maps;
            if (map) {
                var center = this.state.currentLocation;
                map.setCenter(center);
                maps.event.trigger(map, "center_changed");
            }
        };
        Map.prototype.renderChildren = function () {
            var _this = this;
            logger.debug(this.loggerNode + ".renderChildren");
            var children = this.props.children;
            if (!children) {
                return;
            }
            return React.Children.map(children, function (c) {
                var child = c;
                if (React.isValidElement(c)) {
                    return React.cloneElement(child, {
                        google: _this.props.google,
                        map: _this.map,
                        mapCenter: _this.state.currentLocation,
                    });
                }
            });
        };
        Map.defaultProps = {
            centerAroundCurrentLocation: false,
            className: "",
            containerStyle: {},
            google: null,
            mapTypeId: typeof google !== "undefined" ? google.maps.MapTypeId.ROADMAP : undefined,
            style: {},
            widgetID: "GoogleMaps",
            zoom: 14,
        };
        return Map;
    }(React.Component));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Map;
    ;
});
//# sourceMappingURL=Map.js.map