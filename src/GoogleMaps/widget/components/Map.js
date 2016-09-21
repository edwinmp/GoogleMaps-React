var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "GoogleMaps/lib/react", "GoogleMaps/lib/react-dom", "dojo/Deferred"], function (require, exports, React, ReactDOM, dojoDeferred) {
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
    var evtNames = ["ready", "click", "dragend", "recenter"];
    var Map = (function (_super) {
        __extends(Map, _super);
        function Map(props) {
            _super.call(this, props);
            logger.debug("Map" + ".constructor");
            if (!props.hasOwnProperty("google") || props.google == null) {
                logger.debug("Map" + ".You must include a 'googpe' prop");
                throw new Error("You must include a `google` prop.");
            }
            this.listeners = [];
            this.state = {
                currentLocation: {
                    lat: this.props.initialCenter.lat,
                    lng: this.props.initialCenter.lng,
                },
            };
        }
        Map.prototype.componentDidMount = function () {
            var _this = this;
            if (this.props.centerAroundCurrentLocation) {
                if (navigator && navigator.geolocation) {
                    this.geoPromise = new dojoDeferred(function (resolve, reject) {
                        navigator.geolocation.getCurrentPosition(resolve, reject);
                    });
                    this.geoPromise.promise.then(function (pos) {
                        var coords = pos.coords;
                        _this.setState({
                            currentLocation: {
                                lat: coords.latitude,
                                lng: coords.longitude,
                            },
                        });
                    }, function (error) { return error; });
                }
            }
            this.loadMap();
        };
        Map.prototype.componentDidUpdate = function (prevProps, prevState) {
            if (prevProps.google !== this.props.google) {
                this.loadMap();
            }
            if (this.props.visible !== prevProps.visible) {
                this.restyleMap();
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
            var google = this.props.google;
            if (this.geoPromise) {
                this.geoPromise.cancel("Component is unmounting!", false);
            }
            Object.keys(this.listeners).forEach(function (e) {
                google.maps.event.removeListener(_this.listeners[e]);
            });
        };
        Map.prototype.render = function () {
            var style = Object.assign({}, mapStyles.map, this.props.style, {
                display: this.props.visible ? "inherit" : "none",
            });
            var containerStyles = Object.assign({}, mapStyles.container, this.props.containerStyle);
            return (React.createElement("div", {style: containerStyles, className: this.props.className}, React.createElement("div", {style: style, ref: "map"}, "Loading map..."), this.renderChildren()));
        };
        Map.prototype.loadMap = function () {
            var _this = this;
            if (this.props && this.props.google) {
                var google_1 = this.props.google;
                var maps = google_1.maps;
                var mapRef = this.refs.map;
                var node = ReactDOM.findDOMNode(mapRef);
                var curr = this.state.currentLocation;
                var center = new maps.LatLng(curr.lat, curr.lng);
                var mapConfig = Object.assign({}, {
                    center: center,
                    zoom: this.props.zoom,
                });
                this.map = new maps.Map(node, mapConfig);
                evtNames.forEach(function (e) {
                    _this.listeners[e] = _this.map.addListener(e, _this.handleEvent(e));
                });
                maps.event.trigger(this.map, "ready");
                this.forceUpdate();
            }
        };
        Map.prototype.camelize = function (str) {
            str = str.replace(/\W+(.)/g, function (match, chr) {
                return chr.toUpperCase();
            });
            return str.replace(/(?:^|[-_])(\w)/g, function (_, c) {
                return c ? c.toUpperCase() : "";
            });
        };
        Map.prototype.handleEvent = function (evtName) {
            var _this = this;
            var timeout;
            var handlerName = "on" + this.camelize(evtName);
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
            var map = this.map;
            var google = this.props.google;
            var maps = google.maps;
            if (!google) {
                return;
            }
            ;
            if (map) {
                var center = this.state.currentLocation;
                if (!(center instanceof google.maps.LatLng)) {
                    center = new google.maps.LatLng(center.lat, center.lng);
                }
                map.setCenter(center);
                maps.event.trigger(map, "recenter");
            }
        };
        Map.prototype.restyleMap = function () {
            if (this.map) {
                var google_2 = this.props.google;
                google_2.maps.event.trigger(this.map, "resize");
            }
        };
        Map.prototype.renderChildren = function () {
            var _this = this;
            var children = this.props.children;
            if (!children) {
                return;
            }
            ;
            return React.Children.map(children, function (c) {
                return React.cloneElement(c, {
                    google: _this.props.google,
                    map: _this.map,
                    mapCenter: _this.state.currentLocation,
                });
            });
        };
        Map.defaultProps = {
            center: {},
            centerAroundCurrentLocation: false,
            className: "",
            containerStyle: {},
            google: null,
            initialCenter: {
                lat: 37.774929,
                lng: -122.419416,
            },
            style: {},
            visible: true,
            zoom: 14,
        };
        return Map;
    }(React.Component));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Map;
    ;
});
