declare var logger: mendix.logger;
declare var google: Object;
declare var mx: mx.mx;
// declare var window: IMapsWindow;
// import dependencies
import * as React from "GoogleMaps/lib/react";

// import components
import GoogleApi from "./GoogleApi";

// interface IMapsWindow extends Window {
//     isScriptLoaded: boolean;
//     isScriptLoading: boolean;
// }
interface IWrapperProps {
    apiKey: string;
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
export default class Wrapper extends React.Component<IWrapperProps, IWrapperState> {
    public static defaultProps: IWrapperProps = {
        apiKey: "",
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
        logger.debug("Wrapper" + ".constructor");
        super(props);
        // instatiate class variables
        this.libraries = ["geometry", "places", "visualization", "places"];
        this.googleMapsApiBaseUrl = "https://maps.googleapis.com/maps/api/js";
        this.loggerNode = "Wrapper";
        this.isScriptLoading = false;
        if (typeof google === "undefined") {
            this.google = null;
        }
        // default state
        this.state = {
            alert: { hasAlert: false },
            isScriptLoaded: false,
        };
        // bind context TODO: Use Autobind
        this.getGoogleMapsApiUrl = this.getGoogleMapsApiUrl.bind(this);
        this.onLibraryLoaded = this.onLibraryLoaded.bind(this);
        this.onLibraryLoadingError = this.onLibraryLoadingError.bind(this);
        this.onLibraryLoading = this.onLibraryLoading.bind(this);
        this.alertDiv = this.alertDiv.bind(this);
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
        const GoogleComponent = GoogleApi([this.getGoogleMapsApiUrl()]);
        if (!this.isScriptLoading || this.state.isScriptLoaded) {
            return (
                <GoogleComponent
                    {...this.props}
                    onScriptLoaded={this.onLibraryLoaded}
                    isScriptLoaded={this.state.isScriptLoaded}
                    isScriptLoading={this.isScriptLoading}
                    onScriptLoading={this.onLibraryLoading}
                    onScriptLoadingError={this.onLibraryLoadingError}
                />
            );
        }
        return null;
    }
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
        return `${this.googleMapsApiBaseUrl}?key=${this.props.apiKey}&libraries=${this.libraries.join()}`;
    }
    /**
     * Called when google Maps API script is successfully loaded
     * 
     * @private
     * 
     * @memberOf GoogleMaps
     */
    private onLibraryLoaded() {
        logger.debug(this.loggerNode + "... Script Loaded!");
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
        logger.debug(this.loggerNode + "... Script Loading!");
        this.isScriptLoading = true;
    }
    /**
     * Called when google Maps API script failes to load
     * 
     * @private
     * 
     * @memberOf GoogleMaps
     */
    private onLibraryLoadingError() {
        logger.debug(this.loggerNode + "... Library Loading Failed!");
        this.setState({
            alert: {
                alertText: "Failed to load google maps script ... please check your internet connection",
                hasAlert: true,
            },
            isScriptLoaded: false,
        });
        this.isScriptLoading = false;
    }
    // call the microflow and remove progress on finishing
    private callMicroflow(microflow: string, successCallback?: Function, errorCallback?: Function) {
        logger.debug(this.loggerNode + ".callMicroflow");
        mx.data.action({
            callback: successCallback,
            error: errorCallback,
            params: {
                actionname: microflow,
            },
            store: {
                caller: this.props.widget.mxform,
            },
        });
    }
};
