import * as React from "GoogleMaps/lib/react";

interface InfoWindowProps extends React.Props<InfoWindow> {
    map?: google.maps.Map;
    mapCenter?: google.maps.LatLng;
    marker?: google.maps.Marker;
    visible?: boolean;
    onClose?: Function;
    onOpen?: Function;
}

export class InfoWindow extends React.Component<InfoWindowProps, any> {
    public static defaultProps: InfoWindowProps = {
        visible: false,
    };
    private infoWindow: google.maps.InfoWindow;
    public componentDidMount() {
        this.renderInfoWindow();
    }

    public componentDidUpdate(prevProps: InfoWindowProps) {
        const {map} = this.props;

        if (!google || !map) {
            return;
        }

        if (map !== prevProps.map) {
            this.renderInfoWindow();
        }

        if (this.props.children !== prevProps.children) {
            this.updateContent();
        }

        if ((this.props.visible !== prevProps.visible ||
            this.props.marker !== prevProps.marker)) {
            this.props.visible ?
                this.openWindow() :
                this.closeWindow();
        }
    }

    public render(): null {
        return null;
    }

    private renderInfoWindow() {
        if (!google || !google.maps) {
            return;
        }

        const iw = this.infoWindow = new google.maps.InfoWindow({
            content: "",
        });

        google.maps.event.addListener(iw, "closeclick", this.onClose.bind(this));
        google.maps.event.addListener(iw, "domready", this.onOpen.bind(this));
    }

    private onOpen() {
        if (this.props.onOpen) {
            this.props.onOpen();
        }
    }

    private onClose() {
        if (this.props.onClose) {
            this.props.onClose();
        }
    }

    private openWindow() {
        this.infoWindow.open(this.props.map, this.props.marker);
    }

    private updateContent() {
        const content = this.renderChildren();
        this.infoWindow.setContent(content);
    }

    private closeWindow() {
        this.infoWindow.close();
    }

    private renderChildren() {
        const {children} = this.props;
        return children.toString();
    }
}

export default InfoWindow;
