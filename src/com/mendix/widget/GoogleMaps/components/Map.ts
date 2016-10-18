import { Children, Component, DOM, cloneElement, isValidElement } from "com/mendix/widget/GoogleMaps/lib/react";

export interface MapProps extends React.Props<Map> {
    zoom?: number;
    center?: google.maps.LatLng;
    mapTypeId?: google.maps.MapTypeId;
    [key: string]: any;
}

interface MapState {
    currentLocation: google.maps.LatLng;
}

export class Map extends Component<MapProps, MapState> {
    static defaultProps: MapProps = {
        mapTypeId: typeof google !== "undefined" ? google.maps.MapTypeId.ROADMAP : undefined,
        zoom: 14
    };
    private mapRef: HTMLElement;
    private map: google.maps.Map;
    private bounds: google.maps.LatLngBounds;

    constructor(props: MapProps) {
        super(props);

        if (typeof google === "undefined") {
            throw new Error("google object is not loaded");
        }
        this.bounds = new google.maps.LatLngBounds();
        this.state = {
            currentLocation: new google.maps.LatLng(props.center.lat(), props.center.lng())
        };
        this.setMapBounds = this.setMapBounds.bind(this);
    }

    componentDidMount() {
        this.loadMap();
    }

    componentDidUpdate(prevProps: MapProps, prevState: MapState) {
        if (this.props.center !== prevProps.center) {
            this.setState({ currentLocation: this.props.center });
        }
        if (prevState.currentLocation !== this.state.currentLocation) {
            this.centerMap();
        }
    }

    render() {
        const { div } = DOM;
        return (
            div({ className: "google-map-container" },
                div({ className: "google-map", ref: (c) => this.mapRef = c }),
                this.renderChildren()
            )
        );
    }

    private loadMap() {
        const props = this.props;
        if (props && typeof google !== "undefined") {
            const { mapTypeId, zoom } = props;
            const location = this.state.currentLocation;
            const mapTypeControlOptions: google.maps.MapTypeControlOptions = {
                style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR
            };
            const mapConfig: google.maps.MapOptions = {
                center: new google.maps.LatLng(location.lat(), location.lng()),
                mapTypeControlOptions,
                mapTypeId,
                zoom
            };
            this.map = new google.maps.Map(this.mapRef, mapConfig);
            this.setMapBounds();
            this.map.fitBounds(this.bounds); // TODO: Control with a prop
            google.maps.event.trigger(this.map, "ready");
            this.forceUpdate();
        }
    }

    private centerMap() {
        const map = this.map;
        if (google && map) {
            map.setCenter(this.state.currentLocation);
            google.maps.event.trigger(map, "center_changed");
        }
    }

    private renderChildren() {
        const {children} = this.props;

        if (!children) { return; }

        return Children.map(children, (c: React.ReactElement<any>) => {
            const child = c;
            if (isValidElement(c)) {
                return cloneElement(child, {
                    google,
                    map: this.map,
                    mapCenter: this.state.currentLocation
                });
            }
        });
    }

    private setMapBounds() {
        const {children} = this.props;
        if (!children) { return; }
        return Children.map(children, (c: React.ReactElement<any>) => {
            const child = c;
            if (isValidElement(c)) {
                if (typeof child.props.position !== "undefined") {
                    this.bounds.extend(child.props.position);
                }
            }
        });
    }
}
