import * as React from "com/mendix/widget/GoogleMaps/lib/react";

import * as DojoDeferred from "dojo/Deferred";

import Info from "./Info";
import InfoWindow from "./InfoWindow";

export interface MarkerProps extends React.Props<Marker> {
    map?: google.maps.Map;
    position?: google.maps.LatLng;
    mapCenter?: google.maps.LatLng;
    icon?: string;
    infoWindow?: InfoWindowOptions;
    onClick?: Function;
    [key: string]: any;
}
interface MarkerState {
    showInfoWindow: boolean;
}
export interface InfoWindowOptions {
    content?: string;
    classes?: string;
}

export default class Marker extends React.Component<MarkerProps, MarkerState> {
    private markerPromise: dojo.Deferred;
    private marker: google.maps.Marker;
    public constructor(props: MarkerProps) {
        super(props);
        this.state = {
            showInfoWindow: false
        };
        this.onClick = this.onClick.bind(this);
        this.onInfoWindowClose = this.onInfoWindowClose.bind(this);
    }
    public componentDidMount() {
        this.markerPromise = new DojoDeferred();
        this.renderMarker();
    }

    public componentDidUpdate(prevProps: MarkerProps) {
        if ((this.props.map !== prevProps.map) || (this.props.position !== prevProps.position)) {
            this.renderMarker();
        }
    }

    public componentWillUnmount() {
        if (this.marker) {
            this.marker.setMap(null); // remove marker
        }
    }

    public render() {
        const infoWindowOptions = this.props.infoWindow;
        if (infoWindowOptions) {
            const classes: string = infoWindowOptions.classes ? infoWindowOptions.classes : null;
            const content: string = infoWindowOptions.content ? infoWindowOptions.content : "";
            return (
                <InfoWindow
                    visible={this.state.showInfoWindow}
                    map={this.props.map}
                    marker={this.marker}
                    onClose={this.onInfoWindowClose}
                >
                    <Info classes={classes}>
                        {content}
                    </Info>
                </InfoWindow>
            );
        }
        return null;
    }
    private renderMarker(): void {
        let {map, position, mapCenter} = this.props;
        if (!google) {
            return;
        }

        position = position || mapCenter;
        const isLatLng = position instanceof google.maps.LatLng;
        if (!isLatLng) {
            position = new google.maps.LatLng(position.lat(), position.lng());
        }

        const markerConfig = {
            map,
            position
        };
        this.marker = new google.maps.Marker(markerConfig);

        this.marker.addListener("click", this.onClick);
        this.markerPromise.resolve(this.marker);
    }

    private onClick(event: Event) {
        const infoWindowOptions = this.props.infoWindow;
        if (infoWindowOptions) {
            this.setState({ showInfoWindow: true });
        }
        if (this.props.onClick) {
            this.props.onClick(event);
        }
    }
    private onInfoWindowClose() {
        this.setState({ showInfoWindow: false });
    }
}
