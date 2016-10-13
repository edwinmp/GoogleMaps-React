// import dependencies
import * as React from "GoogleMaps/lib/react";

// import components
import {MapData} from "../GoogleMaps";
import Map, {MapProps} from "./Map";
import Marker, {InfoWindowOptions} from "./Marker";

interface WrapperProps extends React.Props<Wrapper> {
    appearance: MapAppearance;
    apiKey: string;
    behaviour: MapBehaviour;
    data: Array<MapData>;
    height: number;
    onClickMarker?: Function;
    widgetID: string;
    width: number;
}
interface WrapperState {
    isScriptLoaded: boolean;
    alert?: Alert;
}
interface Alert {
    hasAlert: boolean;
    alertText?: string;
}
export interface MapBehaviour {
    apiAccessKey?: string;
    defaultLat?: number;
    defaultLng?: number;
    zoom?: number;
}
export interface MapAppearance {
    defaultMapType?: MapTypeIds;
}
export type MapTypeIds = "ROADMAP" | "HYBRID" | "SATELLITE" | "TERRAIN";

export default class Wrapper extends React.Component<WrapperProps, WrapperState> {
    public static defaultProps: WrapperProps = {
        apiKey: "",
        appearance: {},
        behaviour: {},
        data: [],
        height: 0,
        widgetID: "GoogleMaps",
        width: 0,
    };
    private libraries: string[];
    private googleMapsApiBaseUrl: string;
    private google: Object;
    private loggerNode: string;

    public constructor(props: WrapperProps) {
        super(props);
        this.loggerNode = this.props.widgetID + ".Wrapper";
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
                isScriptLoaded: false,
            };
            this.loadGoogleScript(this.getGoogleMapsApiUrl(), this.onScriptLoaded, this.onScriptLoadingError);
        } else {
            this.state = {
                alert: { hasAlert: false },
                isScriptLoaded: true,
            };
        }
    }
    public render() {
        logger.debug(this.loggerNode + ".render");
        const props = this.props;
        const style = {
            height: props.height !== 0 ? props.height + "px" : "100%",
            width: props.width !== 0 ? props.width + "px" : "auto",
        };
        return (
            <div style={style} >
                {this.alertDiv()}
                {this.getContent()}
            </div>
        );
    }
    private getContent() {
        logger.debug(this.loggerNode + ".getContent");
        if (this.state.isScriptLoaded) {
            const props = this.props;
            const behaviour = props.behaviour;
            const appearance = props.appearance;
            const mapProps: MapProps = {
                centerAroundCurrentLocation: false,
                google,
                initialCenter: this.getInitialCenter(),
                mapTypeId: this.getMapTypeId(appearance.defaultMapType),
                widgetID: props.widgetID,
                zoom: behaviour.zoom,
            };
            return (
                <Map {...mapProps} >
                    <Marker
                        widgetID={this.props.widgetID}
                        onClick={this.props.onClickMarker}
                    />
                    {this.getMarkers(props.data)}
                </Map>
            );
        } else {
             // TODO: Make translatable
            return (
                <div>
                    Loading ...
                </div>
            );
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
            return (
                <div className="alert-pane alert alert-danger">
                    {alertState.alertText}
                </div>
            );
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
                isScriptLoaded: true,
            });
        }
    }
    private onScriptLoadingError() {
        logger.debug(this.loggerNode + ".onScriptLoadingError");
        this.setState({
            alert: {
                alertText: "Failed to load google maps script ... please check your internet connection",
                hasAlert: true,
            },
            isScriptLoaded: false,
        });
    }
    private getMarkers(data: Array<MapData>) {
        if (data.length > 0) {
            let key = 0;
            return data.map((location) => {
                key++;
                const position = new google.maps.LatLng(location.latitude, location.longitude);
                const infoWindow: InfoWindowOptions = {content: location.info};
                const onClickMarker = this.props.onClickMarker
                    ? () => this.props.onClickMarker([location.guid])
                    : null;
                return (
                    <Marker
                        position={position}
                        key={key}
                        infoWindow={infoWindow}
                        widgetID={this.props.widgetID}
                        onClick={onClickMarker}
                    />
                );
            });
        }
    }
    private getInitialCenter(): google.maps.LatLng {
        const behaviour = this.props.behaviour;
        const data = this.props.data;
        if (data.length === 1 && behaviour.defaultLat === 0.0 && behaviour.defaultLng === 0.0) {
            return new google.maps.LatLng(data[0].latitude, data[0].longitude);
        }
        return new google.maps.LatLng(behaviour.defaultLat, behaviour.defaultLng);
    }
};
