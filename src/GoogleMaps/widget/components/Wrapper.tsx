declare var window: IWindow;
// import dependencies
import * as React from "GoogleMaps/lib/react";

// import components
import Map, {MapProps} from "./Map";

interface IWindow extends Window {
    loadedScript: Array<string>;
}
interface WrapperProps {
    appearance: MapAppearance;
    apiKey: string;
    behaviour: MapBehaviour;
    height: number;
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
    defaultLat?: string;
    defaultLng?: string;
}
export interface MapAppearance {
    defaultMapType?: string;
}

export default class Wrapper extends React.Component<WrapperProps, WrapperState> {
    public static defaultProps: WrapperProps = {
        apiKey: "",
        appearance: {},
        behaviour: {},
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
        if (!window.loadedScript) {
            window.loadedScript = [];
        }
        // bind context
        this.getGoogleMapsApiUrl = this.getGoogleMapsApiUrl.bind(this);
        this.onScriptLoaded = this.onScriptLoaded.bind(this);
        this.onScriptLoadingError = this.onScriptLoadingError.bind(this);
        this.alertDiv = this.alertDiv.bind(this);

        // load google api script
        const src = this.getGoogleMapsApiUrl();
        if ((window.loadedScript && window.loadedScript.indexOf(src) < 0) || typeof google === "undefined") {
            this.google = null;
            this.state = {
                alert: { hasAlert: false },
                isScriptLoaded: false,
            };
            this.loadGoogleScript(src, this.onScriptLoaded, this.onScriptLoadingError);
        } else {
            this.state = {
                alert: { hasAlert: false },
                isScriptLoaded: true,
            };
        }
    }
    /**
     * Life cycle: Called to render the component
     * 
     */
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
    /**
     * Returns component that loads the google api and subsequently the Map component
     * 
     */
    private getContent() {
        logger.debug(this.loggerNode + ".getContent");
        if (this.state.isScriptLoaded) {
            const behaviour = this.props.behaviour;
            const appearance = this.props.appearance;
            const mapProps: MapProps = {
                centerAroundCurrentLocation: false,
                google,
                initialCenter: new google.maps.LatLng(Number(behaviour.defaultLat), Number(behaviour.defaultLng)),
                mapTypeId: google.maps.MapTypeId[appearance.defaultMapType as any],
                widgetID: this.props.widgetID,
            };
            return (
                <Map
                    {...mapProps}
                />
            );
        } else {
            return (
                <div>
                    Loading ...
                </div>
            );
        }
    }
    /**
     * Load google api script that's required to use the google maps
     * Execute the success and error callbacks to handle the respective events
     * 
     */
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
    /**
     * Returns google maps api script
     * 
     */
    private getGoogleMapsApiUrl() {
        return this.googleMapsApiBaseUrl +
               "?key=" +
               this.props.apiKey +
               "&libraries=" +
               this.libraries.join();
    }
    /**
     * Called when google Maps API script is successfully loaded
     * 
     */
    private onScriptLoaded() {
        logger.debug(this.loggerNode + ".onScriptLoaded");
        if (!this.state.isScriptLoaded && google) {
            this.google = google;
            this.addCache(this.getGoogleMapsApiUrl());
            if (this.state.alert.hasAlert) {
                this.setState({
                    alert: { hasAlert: false },
                    isScriptLoaded: true,
                });
            } else {
                this.setState({ isScriptLoaded: true });
            }
        }
    }
    /**
     * Called when google maps API script fails to load
     * 
     */
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
    /**
     * Keep track of loaded scripts so as not to load them more than once
     * 
     */
    private addCache = (entry: string) => {
        if (window.loadedScript && window.loadedScript.indexOf(entry) < 0) {
            window.loadedScript.push(entry);
        }
    };
};
