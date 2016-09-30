// declare var window: IMapsWindow;
// import dependencies
import * as React from "GoogleMaps/lib/react";

// import components
import GoogleApi from "./GoogleApi";

interface IWrapperProps {
    apiKey: string;
    behaviour: IMapBehaviour;
    height: number;
    widget: mxui.widget._WidgetBase;
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
    defaultLat?: string;
    defaultLng?: string;
}

export default class Wrapper extends React.Component<IWrapperProps, IWrapperState> {
    public static defaultProps: IWrapperProps = {
        apiKey: "",
        behaviour: {},
        height: 0,
        widget: null,
        width: 0,
    };
    private libraries: string[];
    private googleMapsApiBaseUrl: string;
    private isScriptLoading: boolean;
    private google: Object;
    private loggerNode: string;

    public constructor(props: IWrapperProps) {
        super(props);
        this.loggerNode = this.props.widget.id + ".Wrapper";
        logger.debug(this.loggerNode + ".constructor");
        // instatiate class variables
        this.libraries = ["geometry", "places", "visualization", "places"];
        this.googleMapsApiBaseUrl = "https://maps.googleapis.com/maps/api/js";
        this.isScriptLoading = false;
        if (typeof google === "undefined") {
            this.google = null;
        }
        // default state
        this.state = {
            alert: { hasAlert: false },
            isScriptLoaded: false,
        };
        // bind context
        this.getGoogleMapsApiUrl = this.getGoogleMapsApiUrl.bind(this);
        this.onLibraryLoaded = this.onLibraryLoaded.bind(this);
        this.onLibraryLoadingError = this.onLibraryLoadingError.bind(this);
        this.onLibraryLoading = this.onLibraryLoading.bind(this);
        this.alertDiv = this.alertDiv.bind(this);
    }
    /**
     * Lifecycle: Called to render the component
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
        const GoogleComponent = GoogleApi([this.getGoogleMapsApiUrl()]);
        if (!this.isScriptLoading || this.state.isScriptLoaded) {
            return (
                <GoogleComponent
                    {...this.props}
                    isScriptLoaded={this.state.isScriptLoaded}
                    isScriptLoading={this.isScriptLoading}
                    onScriptLoaded={this.onLibraryLoaded}
                    onScriptLoading={this.onLibraryLoading}
                    onScriptLoadingError={this.onLibraryLoadingError}
                />
            );
        }
        return null;
    }
    /**
     * Creates an alert
     * TODO: Consider making this a component with option to support other alert classes
     * 
     * @private
     * @returns
     * 
     * @memberOf Wrapper
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
     * @private
     * 
     * @memberOf GoogleMaps
     */
    private onLibraryLoaded() {
        logger.debug(this.loggerNode + ".onLibraryLoaded");
        if (!this.state.isScriptLoaded && google) {
            // window.isScriptLoaded = true;
            this.google = google;
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
     * Called when google Maps API script is loading
     * 
     * @private
     * 
     * @memberOf GoogleMaps
     */
    private onLibraryLoading() {
        logger.debug(this.loggerNode + ".onLibraryLoading");
        this.isScriptLoading = true;
    }
    /**
     * Called when google Maps API script fails to load
     * 
     * @private
     * 
     * @memberOf GoogleMaps
     */
    private onLibraryLoadingError() {
        logger.debug(this.loggerNode + ".onLibraryLoadingError");
        this.setState({
            alert: {
                alertText: "Failed to load google maps script ... please check your internet connection",
                hasAlert: true,
            },
            isScriptLoaded: false,
        });
        this.isScriptLoading = false;
    }
};
