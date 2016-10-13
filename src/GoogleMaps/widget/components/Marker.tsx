import * as React from "GoogleMaps/lib/react";

import * as dojoDeferred from "dojo/Deferred";

import { toCamelCase } from "../utils/utils";

import Info from "./Info";
import InfoWindow from "./InfoWindow";

const eventNames = ["click", "mouseover", "recenter"];

interface MarkerProps extends React.Props<Marker> {
    map?: google.maps.Map;
    position?: google.maps.LatLng;
    google?: Object;
    mapCenter?: google.maps.LatLng;
    icon?: string;
    infoWindow?: InfoWindowOptions;
    widgetID: string;
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
    public static defaultProps: MarkerProps = {
        google: typeof google !== "undefined" ? google : null,
        widgetID: "GoogleMaps",
    };
    private markerPromise: dojo.Deferred;
    private marker: google.maps.Marker;
    private loggerNode: string;
    public constructor(props: MarkerProps) {
        super(props);
        this.loggerNode = this.props.widgetID + ".Marker";
        logger.debug(this.loggerNode + ".constructor");
        this.state = {
            showInfoWindow: true,
        };
    }
    public componentDidMount() {
        this.markerPromise = new dojoDeferred();
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
            position,
        };
        this.marker = new google.maps.Marker(markerConfig);

        eventNames.forEach(eventName => {
            this.marker.addListener(eventName, this.handleEvent(eventName));
        });

        this.markerPromise.resolve(this.marker);
    }

    private handleEvent(eventName: string) {
        return (event: Event) => {
            eventName = "on" + toCamelCase(eventName);
            const eventFunction = this.props[eventName] as Function;
            if (eventFunction) {
                eventFunction(this.props, this.marker, event);
            }
        };
    }
}
