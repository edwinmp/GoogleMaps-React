import { Component, Props, ReactElement, createElement } from "com/mendix/widget/GoogleMaps/lib/react";

import {MapData} from "../GoogleMaps";
import {Map, MapProps} from "./Map";
import Marker, { MarkerProps } from "./Marker";

export interface WrapperProps extends Props<Wrapper> {
    apiKey: string;
    data?: MapData[];
    height?: number;
    onClickMarker?: Function;
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
    static defaultProps: WrapperProps = {
        apiKey: "",
        data: [],
        height: 0,
        width: 0
    };

    constructor(props: WrapperProps) {
        super(props);
        this.getGoogleMapsApiUrl = this.getGoogleMapsApiUrl.bind(this);
        this.handleScriptLoading = this.handleScriptLoading.bind(this);
        this.alertDiv = this.alertDiv.bind(this);

        this.state = {
            alert: { hasAlert: false },
            isScriptLoaded: typeof google !== "undefined" ? true : false
        };
        if (typeof google === "undefined") {
            this.loadGoogleScript(this.getGoogleMapsApiUrl(), this.handleScriptLoading);
        }
    }
    render() {
        const props = this.props;
        const style = {
            height: props.height !== 0 ? props.height + "px" : "100%",
            width: props.width !== 0 ? props.width + "px" : "auto"
        };
        return createElement("div", { style }, this.alertDiv(), this.getContent());
    }
    private getContent(): ReactElement<any> {
        if (this.state.isScriptLoaded) {
            const props = this.props;
            const mapProps: MapProps = {
                center: this.getInitialCenter(),
                centerAroundCurrentLocation: false,
                google: typeof google !== "undefined" ? google : null,
                mapTypeId: this.getMapTypeId(props.defaultMapType),
                zoom: props.zoom
            };
            const defaultMarker = createElement(Marker, { onClick: props.onClickMarker });
            return createElement(Map, mapProps, defaultMarker, this.getMarkers(props.data));
        } else {
            return createElement("div", null, "Loading ..."); // TODO: Make translatable
        }
    }
    private getMapTypeId(mapTypeId: MapTypeIds) {
        if (mapTypeId === "ROADMAP") { return google.maps.MapTypeId.ROADMAP; }
        if (mapTypeId === "HYBRID") { return google.maps.MapTypeId.HYBRID; }
        if (mapTypeId === "SATELLITE") { return google.maps.MapTypeId.SATELLITE; }
        if (mapTypeId === "TERRAIN") { return google.maps.MapTypeId.TERRAIN; }
    }
    private loadGoogleScript(src: string, callback: Function) {
        const script = document.createElement("script");
        script.src = src;
        script.onload = () => callback();
        script.onerror = () => callback();
        document.body.appendChild(script);
    };
    private alertDiv() {
        const alertState = this.state.alert;
        if (alertState && alertState.hasAlert) {
            return createElement("div", { className: "alert-pane alert alert-danger" }, alertState.alertText);
        }
        return null;
    }
    private getGoogleMapsApiUrl() {
        return "https://maps.googleapis.com/maps/api/js?key=" +
               this.props.apiKey + "&libraries=" +
               ["geometry", "places", "visualization", "places"].join();
    }
    private handleScriptLoading() {
        const isScriptLoaded = typeof google !== "undefined";
        this.setState({
            alert: {
                alertText: isScriptLoaded ? "" : "Failed to load script ... please check your internet connection",
                hasAlert: !isScriptLoaded
            },
            isScriptLoaded
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
                    position: new google.maps.LatLng(location.latitude, location.longitude)
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
