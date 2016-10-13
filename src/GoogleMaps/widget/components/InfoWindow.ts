import * as React from "GoogleMaps/lib/react";
import ReactDOM = require("GoogleMaps/lib/react-dom");

interface InfoWindowProps extends React.Props<InfoWindow> {
    map: google.maps.Map;
    mapCenter?: google.maps.LatLng;
    marker: google.maps.Marker;
    visible?: boolean;
    onClose?: Function;
    onOpen?: Function;
    widgetID: string;
}

export class InfoWindow extends React.Component<InfoWindowProps, any> {
    public static defaultProps: InfoWindowProps = {
        map: null,
        marker: null,
        visible: false,
        widgetID: "GoogleMaps",
    };
    private infoWindow: google.maps.InfoWindow;
    private loggerNode: string;
    public constructor(props: InfoWindowProps) {
        super(props);
        this.loggerNode = this.props.widgetID + ".InfoWindow";
        logger.debug(this.loggerNode + ".constructor");
    }
    public componentDidMount() {
        logger.debug(this.loggerNode + ".componentDidMount");
        this.renderInfoWindow();
    }

    public componentDidUpdate(prevProps: InfoWindowProps) {
        logger.debug(this.loggerNode + ".componentDidUpdate");
        const props = this.props;
        const {map} = props;

        if (!google || !map) {
            return;
        }

        if (map !== prevProps.map) {
            this.renderInfoWindow();
        }

        if (props.children !== prevProps.children) {
            this.updateContent();
        }

        if ((props.visible !== prevProps.visible || props.marker !== prevProps.marker)) {
            props.visible ? this.openWindow() : this.closeWindow();
        }
    }

    public render(): null {
        logger.debug(this.loggerNode + ".render");
        return null;
    }

    private renderInfoWindow() {
        logger.debug(this.loggerNode + ".renderInfoWindow");
        if (!google || !google.maps) {
            return;
        }

        const infoWindow = this.infoWindow = new google.maps.InfoWindow({content: ""});

        google.maps.event.addListener(infoWindow, "closeclick", this.onClose.bind(this));
        google.maps.event.addListener(infoWindow, "domready", this.onOpen.bind(this));
    }

    private onOpen() {
        logger.debug(this.loggerNode + ".onOpen");
        if (this.props.onOpen) { this.props.onOpen(); }
    }

    private onClose() {
        logger.debug(this.loggerNode + ".onClose");
        if (this.props.onClose) { this.props.onClose(); }
    }

    private openWindow() {
        logger.debug(this.loggerNode + ".openWindow");
        const {map, marker} = this.props;
        if (map || marker) {
            this.infoWindow.open(map, marker);
        }
    }

    private updateContent() {
        logger.debug(this.loggerNode + ".updateContent");
        const content = this.renderChildren();
        this.infoWindow.setContent(content);
    }

    private closeWindow() {
        logger.debug(this.loggerNode + ".closeWindow");
        this.infoWindow.close();
    }

    private renderChildren() {
        logger.debug(this.loggerNode + ".renderChildren");
        const div = document.createElement("div");
        ReactDOM.render(this.props.children as React.ReactElement<any>, div );
        return div;
    }
}

export default InfoWindow;
