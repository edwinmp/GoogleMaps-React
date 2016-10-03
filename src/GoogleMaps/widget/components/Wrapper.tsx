declare var window: IWindow;
// import dependencies
import * as React from "GoogleMaps/lib/react";

// import components
import Map from "./Map";

interface IWindow extends Window {
    loadedScript: Array<string>;
}
interface IWrapperProps {
    apiKey: string;
    behaviour: IMapBehaviour;
    height: number;
    widgetID: string;
    width: number;
}
interface IWrapperState {
    isScriptLoaded: boolean;
    alert?: IAlert;
}
interface IAlert {
    hasAlert: boolean;
    alertText?: string;
}
export interface IMapBehaviour {
    apiAccessKey?: string;
    defaultLat?: string;
    defaultLng?: string;
}

export default class Wrapper extends React.Component<IWrapperProps, IWrapperState> {
    public static defaultProps: IWrapperProps = {
        apiKey: "",
        behaviour: {},
        height: 0,
        widgetID: "GoogleMaps",
        width: 0,
    };
    private libraries: string[];
    private googleMapsApiBaseUrl: string;
    private isScriptLoading: boolean;
    private google: Object;
    private loggerNode: string;

    public constructor(props: IWrapperProps) {
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
     * @returns
     * 
     * @memberOf Wrapper
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
     * @private
     * @returns
     * 
     * @memberOf Wrapper
     */
    private getContent() {
        logger.debug(this.loggerNode + ".getContent");
        const behaviour = this.props.behaviour;
        const mapProps = {
            centerAroundCurrentLocation: false,
            widgetID: this.props.widgetID,
        };
        if (this.state.isScriptLoaded) {
            const initialCenter = new google.maps.LatLng(Number(behaviour.defaultLat), Number(behaviour.defaultLng));
            return (
                <Map
                    {...mapProps}
                    google={google}
                    initialCenter={initialCenter}
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
                <div className="messagePane alert alert-danger">
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
        this.isScriptLoading = false;
    }
    private addCache = (entry: string) => {
        if (window.loadedScript && window.loadedScript.indexOf(entry) < 0) {
            window.loadedScript.push(entry);
        }
    };
};
