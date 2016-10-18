import { Component, Props, ReactElement, createElement } from "com/mendix/widget/GoogleMaps/lib/react";

import {MapData} from "../GoogleMaps";
import Map, {MapProps} from "./Map";
import Marker, { MarkerProps } from "./Marker";

export interface WrapperProps extends Props<Wrapper> {
    apiKey: string;
    data?: MapData[];
    height?: number;
    onClickMarker?: Function;
    widgetId?: string;
    width?: number;
    defaultLat?: number;
    defaultLng?: number;
    zoom?: number;
    defaultMapType?: MapTypeIds;
}
interface WrapperState {
    isScriptLoaded: boolean;
    alert?: Alert;
}
interface Alert {
    hasAlert: boolean;
    alertText?: string;
}
export type MapTypeIds = "ROADMAP" | "HYBRID" | "SATELLITE" | "TERRAIN";

export class Wrapper extends Component<WrapperProps, WrapperState> {
    public static defaultProps: WrapperProps = {
        apiKey: "",
        data: [],
        height: 0,
        widgetId: "GoogleMaps",
        width: 0
    };
    private libraries: string[];
    private googleMapsApiBaseUrl: string;
    private google: Object;
    private loggerNode: string;

    public constructor(props: WrapperProps) {
        super(props);
        this.loggerNode = this.props.widgetId + ".Wrapper";
        logger.debug(this.loggerNode + ".constructor");
        // instantiate class variables
        this.libraries = ["geometry", "places", "visualization", "places"];
        this.googleMapsApiBaseUrl = "https://maps.googleapis.com/maps/api/js";
        // bind context
        this.getGoogleMapsApiUrl = this.getGoogleMapsApiUrl.bind(this);
        this.onScriptLoaded = this.onScriptLoaded.bind(this);
        this.onScriptLoadingError = this.onScriptLoadingError.bind(this);
        this.alertDiv = this.alertDiv.bind(this);

        if (typeof google === "undefined") {
            this.google = null;
            this.state = {
                alert: { hasAlert: false },
                isScriptLoaded: false
            };
            this.loadGoogleScript(this.getGoogleMapsApiUrl(), this.onScriptLoaded, this.onScriptLoadingError);
        } else {
            this.state = {
                alert: { hasAlert: false },
                isScriptLoaded: true
            };
        }
    }
    public render() {
        logger.debug(this.loggerNode + ".render");
        const props = this.props;
        const style = {
            height: props.height !== 0 ? props.height + "px" : "100%",
            width: props.width !== 0 ? props.width + "px" : "auto"
        };
        return createElement("div", { style }, this.alertDiv(), this.getContent());
    }
    private getContent(): ReactElement<any> {
        logger.debug(this.loggerNode + ".getContent");
        if (this.state.isScriptLoaded) {
            const props = this.props;
            const mapProps: MapProps = {
                centerAroundCurrentLocation: false,
                google,
                initialCenter: this.getInitialCenter(),
                mapTypeId: this.getMapTypeId(props.defaultMapType),
                widgetID: props.widgetId,
                zoom: props.zoom
            };
            const defaultMarker = createElement(Marker, { onClick: props.onClickMarker, widgetID: props.widgetId });
            return createElement(Map, mapProps, defaultMarker, this.getMarkers(props.data));
        } else {
             // TODO: Make translatable
            return createElement("div", null, "Loading ...");
        }
    }
    private getMapTypeId(mapTypeId: MapTypeIds) {
        if (mapTypeId === "ROADMAP") {
            return google.maps.MapTypeId.ROADMAP;
        }
        if (mapTypeId === "HYBRID") {
            return google.maps.MapTypeId.HYBRID;
        }
        if (mapTypeId === "SATELLITE") {
            return google.maps.MapTypeId.SATELLITE;
        }
        if (mapTypeId === "TERRAIN") {
            return google.maps.MapTypeId.TERRAIN;
        }
    }
    private loadGoogleScript(src: string, onLoad: Function, onError: Function) {
        const script = document.createElement("script");
        script.src = src;
        script.onload = () => onLoad();
        script.onerror = () => onError();
        document.body.appendChild(script);
    };
    /**
     * Creates an alert
     * TODO: Consider making this a component with option to support other alert classes
     * 
     */
    private alertDiv() {
        logger.debug(this.loggerNode + ".alertDiv");
        const alertState = this.state.alert;
        if (alertState && alertState.hasAlert) {
            return createElement("div", { className: "alert-pane alert alert-danger" }, alertState.alertText);
        }
        return null;
    }
    private getGoogleMapsApiUrl() {
        return this.googleMapsApiBaseUrl +
               "?key=" +
               this.props.apiKey +
               "&libraries=" +
               this.libraries.join();
    }
    private onScriptLoaded() {
        logger.debug(this.loggerNode + ".onScriptLoaded");
        if (!this.state.isScriptLoaded && google) {
            this.google = google;
            const hasAlert = this.state.alert.hasAlert;
            this.setState({
                alert: { hasAlert: hasAlert ? false : hasAlert },
                isScriptLoaded: true
            });
        }
    }
    private onScriptLoadingError() {
        logger.debug(this.loggerNode + ".onScriptLoadingError");
        this.setState({
            alert: {
                alertText: "Failed to load google maps script ... please check your internet connection",
                hasAlert: true
            },
            isScriptLoaded: false
        });
    }
    private getMarkers(data: Array<MapData>) {
        if (data.length > 0) {
            let key = 0;
            return data.map((location) => {
                key++;
                const markerProps: MarkerProps = {
                    infoWindow: { content: location.info },
                    key,
                    onClick: this.props.onClickMarker ? () => this.props.onClickMarker([location.guid]) : null,
                    position: new google.maps.LatLng(location.latitude, location.longitude),
                    widgetID: this.props.widgetId
                };
                return createElement(Marker, markerProps);
            });
        }
    }
    private getInitialCenter(): google.maps.LatLng {
        const props = this.props;
        const data = props.data;
        if (data.length === 1 && props.defaultLat === 0.0 && props.defaultLng === 0.0) {
            return new google.maps.LatLng(data[0].latitude, data[0].longitude);
        }
        return new google.maps.LatLng(props.defaultLat, props.defaultLng);
    }
}
