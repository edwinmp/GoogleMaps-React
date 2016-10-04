import * as React from "GoogleMaps/lib/react";

import * as dojoDeferred from "dojo/Deferred";

import { toCamelCase } from "../utils/utils";

const evtNames = ["click", "mouseover", "recenter"];

interface MarkerProps extends React.Props<Marker> {
    map?: google.maps.Map;
    position?: google.maps.LatLng;
    google?: Object;
    mapCenter?: google.maps.LatLng;
    icon?: string;
    [key: string]: any;
}

export default class Marker extends React.Component<MarkerProps, any> {
    public static defaultProps: MarkerProps = {
        google: typeof google !== "undefined" ? google : null,
    };
    private markerPromise: dojo.Deferred;
    private marker: google.maps.Marker;

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

    public render(): null {
        return null;
    }

    private renderMarker(): void {
        let {map, position, mapCenter} = this.props;
        if (!google) {
            return;
        }

        position = position || mapCenter;
        let isLatLng = position instanceof google.maps.LatLng;
        if (!isLatLng) {
            position = new google.maps.LatLng(position.lat(), position.lng());
        }

        const markerConfig = {
            map,
            position,
        };
        this.marker = new google.maps.Marker(markerConfig);

        evtNames.forEach(e => {
            this.marker.addListener(e, this.handleEvent(e));
        });

        this.markerPromise.resolve(this.marker);
    }

    private handleEvent(eventName: string) {
        return (e: Event) => {
            eventName = `on${toCamelCase(eventName)}`;
            if (this.props[eventName]) {
                this.props[eventName](this.props, this.marker, e);
            }
        };
    }
}
