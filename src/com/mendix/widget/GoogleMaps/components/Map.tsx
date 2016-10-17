
declare var logger: mendix.logger;

import * as React from "com/mendix/widget/GoogleMaps/lib/react";

// import Utilities
import { toCamelCase } from "../utils/utils";

import * as dojoDeferred from "dojo/Deferred";

interface ILatLng {
    lat: number;
    lng: number;
}
export interface MapProps extends React.Props<Map> {
    google: {};
    zoom?: number;
    centerAroundCurrentLocation?: boolean;
    center?: google.maps.LatLng;
    initialCenter?: google.maps.LatLng;
    mapTypeId?: google.maps.MapTypeId;
    className?: string;
    style?: Object;
    containerStyle?: Object;
    widgetID: string;
    onReady?: Function;
    onClick?: Function;
    OnDragend?: Function;
    onCenterChanged?: Function;
    [key: string]: any;
}

interface MapState {
    currentLocation: google.maps.LatLng;
}

const eventNames = ["ready", "click", "dragend", "center_changed"];
interface Listeners {
    ready?: google.maps.MapsEventListener;
    click?: google.maps.MapsEventListener;
    dragend?: google.maps.MapsEventListener;
    center_changed?: google.maps.MapsEventListener;
    [key: string]: google.maps.MapsEventListener;
}

export default class Map extends React.Component<MapProps, MapState> {
    public static defaultProps: MapProps = {
        centerAroundCurrentLocation: false,
        className: "",
        containerStyle: {},
        google: null,
        mapTypeId: typeof google !== "undefined" ? google.maps.MapTypeId.ROADMAP : undefined,
        style: {},
        widgetID: "GoogleMaps",
        zoom: 14,
    };
    private listeners: Listeners;
    private geoPromise: dojo.Deferred;
    private mapRef: HTMLElement;
    private map: google.maps.Map;
    private loggerNode: string;
    private bounds: google.maps.LatLngBounds;

    constructor(props: MapProps) {
        super(props);
        this.loggerNode = this.props.widgetID + ".Map";
        logger.debug(this.loggerNode + ".constructor");

        if (!props.hasOwnProperty("google") || props.google === null) {
            throw new Error(this.loggerNode + ".You must include a 'google' prop & it must not be null");
        }

        this.listeners = {};
        this.bounds = new google.maps.LatLngBounds();
        this.state = {
            currentLocation: new google.maps.LatLng(props.initialCenter.lat(), props.initialCenter.lng()),
        };
        // bind context
        this.setMapBounds = this.setMapBounds.bind(this);
    }
    public componentDidMount() {
        logger.debug(this.loggerNode + ".componentDidMount");
        // If user wants to see his location, fetch and set it as map's current location
        if (this.props.centerAroundCurrentLocation) {
            if (navigator && navigator.geolocation) {
                this.geoPromise = new dojoDeferred((resolve: PositionCallback, reject: PositionErrorCallback) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject);
                });

                this.geoPromise.promise.then(pos => {
                    const coords = pos.coords;
                    this.setState({
                        currentLocation: new google.maps.LatLng(coords.latitude, coords.longitude),
                    });
                }, error => error);
            }
        }
        this.loadMap();
    }

    public componentDidUpdate(prevProps: MapProps, prevState: MapState) {
        logger.debug(this.loggerNode + ".componentDidUpdate");
        if (prevProps.google !== this.props.google) {
            this.loadMap();
        }
        // if the location coordinates have changed, update state
        if (this.props.center !== prevProps.center) {
            this.setState({
                currentLocation: this.props.center,
            });
        }
        if (prevState.currentLocation !== this.state.currentLocation) {
            this.recenterMap();
        }
    }

    public componentWillUnmount() {
        logger.debug(this.loggerNode + ".componentWillUnmount");
        if (this.geoPromise) {
            this.geoPromise.cancel("Component is unmounting!", false);
        }
        Object.keys(this.listeners).forEach((eventName: string) => {
            google.maps.event.removeListener(this.listeners[eventName]);
        });
    }

    public render() {
        logger.debug(this.loggerNode + ".render");
        const props = this.props;

        return (
            <div style={props.containerStyle} className={props.className + "google-map-container"}>
                <div style={props.style} className={"google-map"} ref={(c) => this.mapRef = c}>
                    Loading map...
                </div>
                {this.renderChildren()}
            </div>
        );
    }
    private loadMap() {
        logger.debug(this.loggerNode + ".loadMap");
        const props = this.props;
        if (props && props.google) {
            const maps = google.maps;
            const { mapTypeId, zoom } = props;
            const location = this.state.currentLocation;
            const center = new google.maps.LatLng(location.lat(), location.lng());
            const mapTypeControlOptions: google.maps.MapTypeControlOptions = {
                style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
            };
            const mapConfig: google.maps.MapOptions = {
                center,
                mapTypeControlOptions,
                mapTypeId,
                zoom,
            };
            // Initialize map with configs above and render it to dom
            this.map = new maps.Map(this.mapRef, mapConfig);
            this.setMapBounds();
            this.map.fitBounds(this.bounds);
            // add event listeners
            eventNames.forEach(eventName => {
                this.listeners[eventName] = this.map.addListener(eventName, this.handleEvent(eventName));
            });
            maps.event.trigger(this.map, "ready");
            this.forceUpdate();
        }
    }
    private handleEvent(eventName: string) {
        logger.debug(this.loggerNode + ".handleEvent");
        let timeout: number;
        // get camelized version of event name... event props are represented this way
        const handlerName = "on" + toCamelCase(eventName);

        return (event: Event) => {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            // Used to execute the event callback asynchronously
            timeout = setTimeout(() => {
                if (this.props[handlerName]) {
                    this.props[handlerName](this.props, this.map, event);
                }
            }, 0);
        };
    }
    private recenterMap() {
        logger.debug(this.loggerNode + ".recenterMap");
        const map = this.map;

        if (google && map) {
            let center = this.state.currentLocation;
            map.setCenter(center);
            google.maps.event.trigger(map, "center_changed");
        }
    }
    private renderChildren() {
        logger.debug(this.loggerNode + ".renderChildren");
        const {children} = this.props;

        if (!children) { return; }

        return React.Children.map(children, (c: React.ReactElement<any>) => {
            const child = c;
            if (React.isValidElement(c)) {
                return React.cloneElement(child, {
                    google: this.props.google,
                    map: this.map,
                    mapCenter: this.state.currentLocation,
                });
            }
        });
    }
    private setMapBounds() {
        logger.debug(this.loggerNode + ".setMapBounds");
        const {children} = this.props;
        if (!children) { return; }
        return React.Children.map(children, (c: React.ReactElement<any>) => {
            const child = c;
            if (React.isValidElement(c)) {
                if (typeof child.props.position !== "undefined") {
                    this.bounds.extend(child.props.position);
                }
            }
        });
    }
};
